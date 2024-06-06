import { ProductLine, Invoice } from './types'

export const initialProductLine: ProductLine = {
  description: '',
  quantity: '1',
  rate: '0.00',
  HSNSAC:'4'
}

export const initialInvoice: Invoice = {
  logo: '',
  logoWidth: 100,
  title: 'INVOICE',
  companyName: 'Company Name',
  name: '',
  companyAddress: '',
  companyAddress2: '',
  OrderNo:'Order No.',
  PANNo:"PAN No.",
  GSTRegistrationNo:'GST Registration No.',
  companyCountry: 'United States',
  billTo: 'Bill To:',
  clientName: '',
  clientAddress: '',
  clientAddress2: '',
  clientCountry: 'United States',
  invoiceTitleLabel: 'Invoice#',
  invoiceTitle: '',
  invoiceDateLabel: 'Invoice Date',
  invoiceDate: '',
  invoiceDueDateLabel: 'Due Date',
  invoiceDueDate: '',
  cityStatePin: '', // Add cityStatePin property
  OrderDate: '', // Add OrderDate property
  productLineDescription: 'Item Description',
  productLineQuantity: 'Qty',
  productLineQuantityRate: 'Rate',
  productLineQuantityAmount: 'Amount',
  paymentTerms:'',
  placeOfSupply:'',
  clientStateUTCode:'',
  invoiceNumber:'',
  referenceNumber:'',
  accountNumber:'',
  description:'',
  footer:'',
  productLines: [
    {
      description: 'Brochure Design',
      quantity: '2',
      rate: '100.00',
      HSNSAC:'',
    },
    { ...initialProductLine },
    { ...initialProductLine },
  ],
  subTotalLabel: 'Sub Total',
  taxLabel: 'Sale Tax (10%)',
  totalLabel: 'TOTAL',
  currency: '$',
  notesLabel: 'Notes',
  notes: 'It was great doing business with you.',
  termLabel: 'Terms & Conditions',
  term: 'Please make the payment by the due date.',
}

