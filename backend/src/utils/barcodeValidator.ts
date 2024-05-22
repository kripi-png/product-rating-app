/*
Written by Roope "kripi-png" Sinisalo @ 2024

Supported formats
- EAN-8, GTIN-8
- EAN-13, GTIN-13
*/

export const validate = (barcode: string): boolean => {
	const l = barcode.length;
	const checkDigit = Number(barcode[l - 1]);
	const barcodeDigits = barcode.substring(0, l - 1);

	let checksum = 0;
	for (let i = 0; i < l - 1; i++) {
		// console.log(barcodeDigits)
		const digit = Number(barcodeDigits[i]);
		if (isNaN(digit))
			throw TypeError('characters in barcode must all be numbers: ' + digit);

		const posFromRight = l - 1 - i;
		const isOdd = posFromRight % 2 === 1;
		const weight = isOdd ? 3 : 1;
		checksum += digit * weight;
	}

	const closestHigher10 = Math.ceil(checksum / 10) * 10;
	const calculatedCheckDigit = closestHigher10 - checksum;
	return calculatedCheckDigit === checkDigit;
};
