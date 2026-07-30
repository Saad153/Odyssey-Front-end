// Shared by InvoiceCharges.js (interactive viewer) and pages/invoice-print/[id].js
// (bare page rendered headlessly for the emailed PDF) so bank account details
// and the total calculation can't drift between the two.

export const bankDetails = {
  one:`
  Bank Name: Soneri Bank Ltd \n
  Bank Branch: Shahrah-e-Faisal Br 0031 Karachi \n
  A/c Title: AIR CARGO SERVICES \n
  A/c #: 20001766466 \n
  Swift Code: SONEPKKAKAR \n
  IBAN: PK02 SONE 0003 1200 0176 6466`,
  two:`
  IBAN: PK91 SONE 0003 1200 0153 4198 \n
  TITLE: SEA NET SHIPPING & LOGISTICS \n
  BANK: SONERI BANK LIMITED  \n
  A/c #: 20001534198 \n
  BRANCH: SHAHRAH-E-FAISAL BRANCH 0031, KARACHI \n
  SWIFT: SONEPKKAXXX`,
  three:`
  IBAN: PK08 BAHL 1054 0081 0028 1201 \n
  A/c #: 1054-0081-002182-01-5 \n
  TITLE: SEA NET SHIPPING & LOGISTICS \n
  BANK: BANK AL HABIB LIMITED \n
  BRANCH: TARIQ ROAD 1054, KARACHI \n
  SWIFT: BAHLPKKAXXX`,
  four:`
  IBAN: PK73 BAHL 1054 0081 0044 1101 \n
  A/c #: 1054-0081-004411-01-7 \n
  TITLE: AIR CARGO SERVICES \n
  BANK: BANK AL HABIB LIMITED \n
  BRANCH: TARIQ ROAD 1054, KARACHI \n
  SWIFT: BAHLPKKAXXX`,
};

export const calculateTotal = (data) => {
  let result = 0;
  data?.forEach((x) => {
    let amount = x.partyType=="client"||x.partyType=="vendor" ? parseFloat(x.local_amount) : parseFloat(x.amount);
    result = x.type == 'Recievable' ? result + parseFloat(amount) : result - parseFloat(amount);
  });
  return Math.abs(result).toFixed(2);
};
