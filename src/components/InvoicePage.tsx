import { Font } from '@react-pdf/renderer'
import { FC, useEffect, useState } from 'react'
import { initialInvoice, initialProductLine } from '../data/initialData'
import { Invoice, ProductLine } from '../data/types'
import Document from './Document'
import Download from './DownloadPDF'
import EditableFileImage from './EditableFileImage'
import EditableInput from './EditableInput'
import EditableTextarea from './EditableTextarea'
import Page from './Page'
import Text from './Text'
import View from './View'


Font.register({
  family: 'Nunito',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/nunito/v12/XRXV3I6Li01BKofINeaE.ttf' },
    {
      src: 'https://fonts.gstatic.com/s/nunito/v12/XRXW3I6Li01BKofA6sKUYevN.ttf',
      fontWeight: 600,
    },
  ],
})

interface Props {
  data?: Invoice
  pdfMode?: boolean
  onChange?: (invoice: Invoice) => void
}

const InvoicePage: FC<Props> = ({ data, pdfMode, onChange }) => {
  const [invoice, setInvoice] = useState<Invoice>(data ? { ...data } : { ...initialInvoice })
  const [subTotal, setSubTotal] = useState<number>()
  const [saleTax, setSaleTax] = useState<number>()
  const [shippingDetails, setShippingDetails] = useState({
    recipientName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    stateUTCode: '',
    cityStatePin: '',
  })

  const dateFormat = 'MMM dd, yyyy'
  const invoiceDate = invoice.invoiceDate !== '' ? new Date(invoice.invoiceDate) : new Date()
  const invoiceDueDate =
    invoice.invoiceDueDate !== ''
      ? new Date(invoice.invoiceDueDate)
      : new Date(invoiceDate.valueOf())

  if (invoice.invoiceDueDate === '') {
    invoiceDueDate.setDate(invoiceDueDate.getDate() + 30)
  }

  const handleChange = (name: keyof Invoice, value: string | number) => {
    if (name !== 'productLines') {
      const newInvoice = { ...invoice }

      if (name === 'logoWidth' && typeof value === 'number') {
        newInvoice[name] = value
      } else if (name !== 'logoWidth' && typeof value === 'string') {
        newInvoice[name] = value
      }

      setInvoice(newInvoice)
    }
  }

  const handleProductLineChange = (index: number, name: keyof ProductLine, value: string) => {
    const productLines = invoice.productLines.map((productLine, i) => {
      if (i === index) {
        const newProductLine = { ...productLine }

        if (name === 'description') {
          newProductLine[name] = value
        } else {
          if (
            value[value.length - 1] === '.' ||
            (value[value.length - 1] === '0' && value.includes('.'))
          ) {
            newProductLine[name] = value
          } else {
            const n = parseFloat(value)

            newProductLine[name] = (n ? n : 0).toString()
          }
        }

        return newProductLine
      }

      return { ...productLine }
    })

    setInvoice({ ...invoice, productLines })
  }

  const handleRemove = (i: number) => {
    const productLines = invoice.productLines.filter((_, index) => index !== i)

    setInvoice({ ...invoice, productLines })
  }

  const handleAdd = () => {
    const productLines = [...invoice.productLines, { ...initialProductLine }]

    setInvoice({ ...invoice, productLines })
  }

  const calculateAmount = (quantity: string, rate: string) => {
    const quantityNumber = parseFloat(quantity)
    const rateNumber = parseFloat(rate)
    const amount = quantityNumber && rateNumber ? quantityNumber * rateNumber : 0

    return amount.toFixed(2)
  }

  useEffect(() => {
    let subTotal = 0

    invoice.productLines.forEach((productLine) => {
      const quantityNumber = parseFloat(productLine.quantity)
      const rateNumber = parseFloat(productLine.rate)
      const amount = quantityNumber && rateNumber ? quantityNumber * rateNumber : 0

      subTotal += amount
    })

    setSubTotal(subTotal)
  }, [invoice.productLines])

  useEffect(() => {
    const match = invoice.taxLabel.match(/(\d+)%/)
    const taxRate = match ? parseFloat(match[1]) : 0
    const saleTax = subTotal ? (subTotal * taxRate) / 100 : 0

    setSaleTax(saleTax)
  }, [subTotal, invoice.taxLabel])

  useEffect(() => {
    if (onChange) {
      onChange(invoice)
    }
  }, [onChange, invoice])

  const handleShippingChange = (name: keyof typeof shippingDetails, value: string) => {
    setShippingDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  return (
    <Document pdfMode={pdfMode}>
      <Page className="invoice-wrapper" pdfMode={pdfMode}>
        {!pdfMode && <Download data={invoice} setData={(d) => setInvoice(d)} />}

        <div>
          <View className="flex" pdfMode={pdfMode}>
            <View className="w-50" pdfMode={pdfMode}>
              <EditableFileImage
                className="logo"
                placeholder="Your Logo"
                value={invoice.logo}
                width={invoice.logoWidth}
                pdfMode={pdfMode}
                onChangeImage={(value) => handleChange('logo', value)}
                onChangeWidth={(value) => handleChange('logoWidth', value)}
              />

              <div className="mt-20">
                <div className="bold">Seller Details:</div>
                <EditableInput
                  className="fs-20 bold"
                  placeholder="Sold By"
                  value={invoice.companyName}
                  onChange={(value) => handleChange('companyName', value)}
                  pdfMode={pdfMode}
                />
                <EditableInput
                  placeholder="Your Name"
                  value={invoice.name}
                  onChange={(value) => handleChange('name', value)}
                  pdfMode={pdfMode}
                />
                <EditableInput
                  placeholder="Company's Address"
                  value={invoice.companyAddress}
                  onChange={(value) => handleChange('companyAddress', value)}
                  pdfMode={pdfMode}
                />
                <EditableInput
                  placeholder="City, State, Pincode"
                  value={invoice.companyAddress2}
                  onChange={(value) => handleChange('companyAddress2', value)}
                  pdfMode={pdfMode}
                />
                <EditableInput
                  placeholder="PAN No."
                  value={invoice.PANNo}
                  onChange={(value) => handleChange('PANNo', value)}
                  pdfMode={pdfMode}
                />
                <EditableInput
                  placeholder="GST Registration No."
                  value={invoice.GSTRegistrationNo}
                  onChange={(value) => handleChange('GSTRegistrationNo', value)}
                  pdfMode={pdfMode}
                />
              </div>
              
              <div className="mt-10">
                <EditableInput
                  placeholder="Place of Supply"
                  value={invoice.placeOfSupply}
                  onChange={(value) => handleChange('placeOfSupply', value)}
                  pdfMode={pdfMode}
                />
              </div>

              <div className="mt-20">
                <div className="bold">Billing Details:</div>
                <EditableInput
                  placeholder="Recipient's Name"
                  value={invoice.clientName}
                  onChange={(value) => handleChange('clientName', value)}
                  pdfMode={pdfMode}
                />
                <EditableInput
                  placeholder="Client's Address"
                  value={invoice.clientAddress}
                  onChange={(value) => handleChange('clientAddress', value)}
                  pdfMode={pdfMode}
                />
                <EditableInput
                  placeholder="City, State, Pincode"
                  value={invoice.clientAddress2}
                  onChange={(value) => handleChange('clientAddress2', value)}
                  pdfMode={pdfMode}
                />
                <EditableInput
                  placeholder="State/UT Code"
                  value={invoice.clientStateUTCode}
                  onChange={(value) => handleChange('clientStateUTCode', value)}
                  pdfMode={pdfMode}
                />
              </div>

              <div className="mt-20">
                <div className="bold">Shipping Details:</div>
                <EditableInput
                  placeholder="Recipient's Name"
                  value={shippingDetails.recipientName}
                  onChange={(value) => handleShippingChange('recipientName', value)}
                  pdfMode={pdfMode}
                />
                <EditableInput
                  placeholder="Shipping Address"
                  value={shippingDetails.address}
                  onChange={(value) => handleShippingChange('address', value)}
                  pdfMode={pdfMode}
                />
                <EditableInput
                  placeholder="City, State, Pincode"
                  value={shippingDetails.cityStatePin}
                  onChange={(value) => handleShippingChange('cityStatePin', value)}
                  pdfMode={pdfMode}
                />
                <EditableInput
                  placeholder="State/UT Code"
                  value={shippingDetails.stateUTCode}
                  onChange={(value) => handleShippingChange('stateUTCode', value)}
                  pdfMode={pdfMode}
                />
              </div>
            </View>

            <View className="w-50" pdfMode={pdfMode}>
              <EditableInput
                className="fs-45 right bold"
                placeholder="Invoice"
                value={invoice.title}
                onChange={(value) => handleChange('title', value)}
                pdfMode={pdfMode}
              />

              <View className="right mt-10" pdfMode={pdfMode}>
                <EditableInput
                  className="bold w-100 right"
                  placeholder="Invoice No."
                  value={invoice.invoiceNumber}
                  onChange={(value) => handleChange('invoiceNumber', value)}
                  pdfMode={pdfMode}
                />
                {/* <EditableCalendarInput
                  className="bold w-100 right"
                  value={invoice.invoiceDate}
                  selected={invoiceDate}
                  onChange={(date) => handleChange('invoiceDate', date ? format(date, dateFormat) : '')}
                  pdfMode={pdfMode}
                /> */}
              </View>

              <View className="right mt-20" pdfMode={pdfMode}>
                <EditableInput
                  className="bold w-100 right"
                  placeholder="Reference No."
                  value={invoice.referenceNumber}
                  onChange={(value) => handleChange('referenceNumber', value)}
                  pdfMode={pdfMode}
                />
                {/* <EditableCalendarInput
                  className="bold w-100 right"
                  value={invoice.invoiceDueDate}
                  selected={invoiceDueDate}
                  onChange={(date) => handleChange('invoiceDueDate', date ? format(date, dateFormat) : '')}
                  pdfMode={pdfMode}
                /> */}
              </View>

              <View className="mt-40 flex" pdfMode={pdfMode}>
                <View className="w-60" pdfMode={pdfMode}>
                  <EditableInput
                    className="bold w-100"
                    placeholder="Account Number"
                    value={invoice.accountNumber}
                    onChange={(value) => handleChange('accountNumber', value)}
                    pdfMode={pdfMode}
                  />
                </View>
                <View className="w-40" pdfMode={pdfMode}>
                  <EditableInput
                    className="bold w-100"
                    placeholder="Payment Terms"
                    value={invoice.paymentTerms}
                    onChange={(value) => handleChange('paymentTerms', value)}
                    pdfMode={pdfMode}
                  />
                </View>
              </View>
            </View>
          </View>

          <View className="mt-20" pdfMode={pdfMode}>
            <EditableInput
              className="w-100"
              placeholder="Description"
              value={invoice.description}
              onChange={(value) => handleChange('description', value)}
              pdfMode={pdfMode}
            />
          </View>

          <View className="mt-20" pdfMode={pdfMode}>
            <View className="flex bg-gray p-4" pdfMode={pdfMode}>
              <Text className="w-48 bold">Product Description</Text>
              <Text className="w-17 bold">HSN/SAC</Text>
              <Text className="w-10 bold right">Quantity</Text>
              <Text className="w-10 bold right">Rate</Text>
              <Text className="w-15 bold right">Amount</Text>
            </View>

            {invoice.productLines.map((productLine, i) => (
              <View key={i} className="flex p-4" pdfMode={pdfMode}>
                <View className="w-48 pb-4" pdfMode={pdfMode}>
                  <EditableTextarea
                    placeholder="Enter item name/description"
                    value={productLine.description}
                    onChange={(value) => handleProductLineChange(i, 'description', value)}
                    pdfMode={pdfMode}
                  />
                </View>
                <View className="w-17 pb-4" pdfMode={pdfMode}>
                  <EditableInput
                    placeholder="HSN/SAC"
                    value={productLine.HSNSAC}
                    onChange={(value) => handleProductLineChange(i, 'HSNSAC', value)}
                    pdfMode={pdfMode}
                  />
                </View>
                <View className="w-10 pb-4" pdfMode={pdfMode}>
                  <EditableInput
                    className="right"
                    value={productLine.quantity}
                    onChange={(value) => handleProductLineChange(i, 'quantity', value)}
                    pdfMode={pdfMode}
                  />
                </View>
                <View className="w-10 pb-4" pdfMode={pdfMode}>
                  <EditableInput
                    className="right"
                    value={productLine.rate}
                    onChange={(value) => handleProductLineChange(i, 'rate', value)}
                    pdfMode={pdfMode}
                  />
                </View>
                <Text className="w-15 right bold pb-4" pdfMode={pdfMode}>
                  {calculateAmount(productLine.quantity, productLine.rate)}
                </Text>
                {!pdfMode && (
                  <button className="link" onClick={() => handleRemove(i)}>
                    <Text pdfMode={pdfMode}>Remove</Text>
                  </button>
                )}
              </View>
            ))}

            {!pdfMode && (
              <View className="flex mt-20">
                <button className="link" onClick={handleAdd}>
                  Add Line Item
                </button>
              </View>
            )}
          </View>

          <View className="mt-20" pdfMode={pdfMode}>
            <View className="flex p-4" pdfMode={pdfMode}>
              <View className="w-50" pdfMode={pdfMode}>
                <EditableTextarea
                  className="w-100"
                  rows={6}
                  placeholder="Enter additional notes"
                  value={invoice.notes}
                  onChange={(value) => handleChange('notes', value)}
                  pdfMode={pdfMode}
                />
              </View>

              <View className="w-50" pdfMode={pdfMode}>
                <View className="flex mb-3" pdfMode={pdfMode}>
                  <Text className="w-60 bold">Sub Total</Text>
                  <Text className="w-40 right">{subTotal?.toFixed(2)}</Text>
                </View>
                <View className="flex mb-3" pdfMode={pdfMode}>
                  <View className="w-60">
                    <EditableInput
                      placeholder="Tax"
                      value={invoice.taxLabel}
                      onChange={(value) => handleChange('taxLabel', value)}
                      pdfMode={pdfMode}
                    />
                  </View>
                  <Text className="w-40 right">{saleTax?.toFixed(2)}</Text>
                </View>
                <View className="flex mb-3" pdfMode={pdfMode}>
                  <Text className="w-60 bold">Total</Text>
                  <Text className="w-40 right bold">
                    {(subTotal && saleTax ? subTotal + saleTax : 0).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </div>
      </Page>
    </Document>
  )
}

export default InvoicePage
