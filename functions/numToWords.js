var a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ',
    'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen ',
];
var b = [ '', '', 'Twenty ', 'Thirty ', 'Forty ', 'Fifty ', 'Sixty ', 'Seventy ', 'Eighty ', 'Ninety ' ];

function threeDigitWords(num) {
    let str = '';
    if (num >= 100) {
        str += a[Math.floor(num / 100)] + 'Hundred ';
        num = num % 100;
    }
    if (num > 0) {
        if (num < 20) {
            str += a[num];
        } else {
            str += b[Math.floor(num / 10)];
            if (num % 10) {
                str += a[num % 10];
            }
        }
    }
    return str;
}

function integerToWords(value) {
    if (value === 0) return 'Zero';

    const scales = [
        { value: 1000000000000, name: 'Trillion' },
        { value: 1000000000, name: 'Billion' },
        { value: 1000000, name: 'Million' },
        { value: 1000, name: 'Thousand' },
    ];

    let remaining = value;
    let words = '';

    for (const scale of scales) {
        const unit = Math.floor(remaining / scale.value);
        if (unit > 0) {
            words += `${threeDigitWords(unit)}${scale.name} `;
            remaining -= unit * scale.value;
        }
    }

    if (remaining > 0) {
        words += threeDigitWords(remaining);
    }

    return words.trim();
}

function numToWords(num) {
    if (num === null || num === undefined || num === '') return '';

    const normalized = typeof num === 'string' ? num.trim() : num;
    const value = Number(normalized);
    if (Number.isNaN(value)) return '';

    const isNegative = value < 0;
    const absValue = Math.abs(value);
    const integerValue = Math.floor(absValue);
    const fractionalValue = Math.round((absValue - integerValue) * 100);

    if (integerValue > 999999999999999) return 'overflow';

    const integerWords = integerToWords(integerValue);
    // const decimalWords = fractionalValue > 0 ? ` and ${fractionalValue.toString().padStart(2, '0')}/100` : '';

    // const result = `${integerWords}${decimalWords}`.trim();
    if (!integerWords) return 'Zero only';

    return `${isNegative ? 'Minus ' : ''}${integerWords} only`;
}

export default numToWords
