import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
import { checkBasicAuthForMetrics } from '../utils/basic-auth';
import { ActivityEntry } from '../types/activity-entry';

const ranges = [
  {
      value: 180,
      title: '180 days',
  },
  {
      value: 90,
      title: '90 days',
  },
  {
      value: 30,
      title: '30 days',
  },
];

export const getServerSideProps: GetServerSideProps = async (context) => {
  const {req, res} = context;

  // @ts-ignore
  await checkBasicAuthForMetrics(req, res)

  return {
    props: {}
  }
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [chart, setChart] = useState<Chart>();
  const [range, setRange] = useState(30);
  const canvas = useRef(null);

  useEffect(() => {
    Chart.register(...registerables);

    // create chart
    // @ts-ignore
    const context = canvas?.current?.getContext('2d');
    if (context) {
      const myChart = Chart.getChart(context);
      if (myChart) { myChart.destroy(); }
      setChart(new Chart(context, {
        type: 'bar',
        data: {
          datasets: [],
        },
        options: {
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'index',
          },
          scales: {
            x: {
              stacked: true,
            },
            y: {
              type: 'linear',
              beginAtZero: true,
              display: true,
              position: 'left',
              stacked: true,
            },
          }
        }
      }));
    }
  }, []);

  useEffect(() => {
    (async function(x) {
      if (chart) {
        setIsLoading(true);
        // get metrics
        const response = await axios({
          method: 'get',
          url: '/api/metrics',
          params: {
            instance: 'vt',
            range,
          }
        });
  
        const data = response.data;
        chart.data = {
          datasets: [
            {
              // @ts-ignore
              data: data.activity.map(o => {
                return {
                  x: o.date,
                  y: o['case found'],
                };
              }),
              yAxisID: 'y',
              backgroundColor: 'rgba(54, 162, 235, 1)',
              label: 'Case Found',
            },
            {
              // @ts-ignore
              data: data.activity.map(o => {
                return {
                  x: o.date,
                  y: o['case not found'],
                };
              }),
              yAxisID: 'y',
              backgroundColor: 'rgba(255, 159, 64, 1)',
              label: 'Case Not Found',
            },
            {
              // @ts-ignore
              data: data.activity.map(o => {
                return {
                  x: o.date,
                  y: o['case not matching regex'],
                };
              }),
              yAxisID: 'y',
              backgroundColor: 'rgba(255, 99, 132, 1)',
              label: 'Invalid Input',
            },
          ]
        };
        chart.update();
  
        setIsLoading(false);
      }
    })()
  }, [chart, range]);

  return (
    <div className="flex flex-col h-screen p-8">
      <Head>
        <title>Metrics - Vermont CourtBot</title>
      </Head>

      <h1 className="text-6xl font-black text-center mb-8 text-green-700">
        Vermont CourtBot Metrics
      </h1>

      <div className="flex">
        {ranges.map(o => {
          return (
            <button
              type="button"
              key={o.value}
              onClick={() => { setRange(o.value) }}
              className={`flex-1 justify-center rounded-md border shadow-sm px-2 py-1 ${range === o.value ? 'border-transparent bg-indigo-600 text-white hover:bg-indigo-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'} text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mx-1 sm:w-auto sm:text-sm`}
            >
              { o.title }
            </button>
          );
        })}
      </div>

      <div className="grow">
        <canvas ref={canvas}></canvas>
      </div>
    </div>
  )
}
