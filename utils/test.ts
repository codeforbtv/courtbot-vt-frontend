import { randomInt } from 'node:crypto';

export function randomPhoneNumber() {
    const phoneNumber = Array(10)
                        .fill(undefined)
                        .map((_, _index) => {
                            return randomInt(0,9).toString();
                        });
    return "+" + phoneNumber.join("");
}