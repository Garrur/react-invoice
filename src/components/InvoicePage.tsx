import { Font, Text as PdfText, View as PdfView } from "@react-pdf/renderer";
import { FC, useEffect, useState } from "react";
import { initialInvoice, initialProductLine } from "../data/initialData";
import { Invoice, ProductLine } from "../data/types";
import Document from "./Document";
import Download from "./DownloadPDF";
import EditableFileImage from "./EditableFileImage";
import EditableInput from "./EditableInput";
import EditableTextarea from "./EditableTextarea";
import Page from "./Page";
import Text from "./Text";
import View from "./View";

// Register font
Font.register({
  family: "Nunito",
  fonts: [
    { src: "https://fonts.gstatic.com/s/nunito/v12/XRXV3I6Li01BKofINeaE.ttf" },
    {
      src: "https://fonts.gstatic.com/s/nunito/v12/XRXW3I6Li01BKofA6sKUYevN.ttf",
      fontWeight: 600,
    },
  ],
});

interface Props {
  data?: Invoice;
  pdfMode?: boolean;
  onChange?: (invoice: Invoice) => void;
}
const InvoicePage: FC<Props> = ({ data, pdfMode, onChange }) => {
  // State hooks
  const [invoice, setInvoice] = useState<Invoice>(
    data ? { ...data } : { ...initialInvoice }
  );
  const [subTotal, setSubTotal] = useState<number>(0);
  const [saleTax, setSaleTax] = useState<number>(0);
  const [shippingDetails, setShippingDetails] = useState({
    recipientName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    stateUTCode: "",
    cityStatePin: "",
  });

  const dateFormat = "MMM dd, yyyy";
  const invoiceDate =
    invoice.invoiceDate !== "" ? new Date(invoice.invoiceDate) : new Date();
  const invoiceDueDate =
    invoice.invoiceDueDate !== ""
      ? new Date(invoice.invoiceDueDate)
      : new Date(invoiceDate.valueOf());

  if (invoice.invoiceDueDate === "") {
    invoiceDueDate.setDate(invoiceDueDate.getDate() + 30);
  }

  const handleChange = (name: keyof Invoice, value: string | number) => {
    if (name !== "productLines") {
      const newInvoice = { ...invoice };

      if (name === "logoWidth" && typeof value === "number") {
        newInvoice[name] = value;
      } else if (name !== "logoWidth" && typeof value === "string") {
        newInvoice[name] = value;
      }

      setInvoice(newInvoice);
    }
  };

  const handleProductLineChange = (
    index: number,
    name: keyof ProductLine,
    value: string
  ) => {
    const productLines = invoice.productLines.map((productLine, i) => {
      if (i === index) {
        const newProductLine = { ...productLine };

        if (name === "description") {
          newProductLine[name] = value;
        } else {
          if (
            value[value.length - 1] === "." ||
            (value[value.length - 1] === "0" && value.includes("."))
          ) {
            newProductLine[name] = value;
          } else {
            const n = parseFloat(value);

            newProductLine[name] = (n ? n : 0).toString();
          }
        }

        return newProductLine;
      }

      return { ...productLine };
    });

    setInvoice({ ...invoice, productLines });
  };

  const handleRemove = (i: number) => {
    const productLines = invoice.productLines.filter((_, index) => index !== i);

    setInvoice({ ...invoice, productLines });
  };

  const handleAdd = () => {
    const productLines = [...invoice.productLines, { ...initialProductLine }];

    setInvoice({ ...invoice, productLines });
  };

  const calculateAmount = (quantity: string, rate: string) => {
    const quantityNumber = parseFloat(quantity);
    const rateNumber = parseFloat(rate);
    const amount =
      quantityNumber && rateNumber ? quantityNumber * rateNumber : 0;

    return amount.toFixed(2);
  };

  useEffect(() => {
    let subTotal = 0;

    invoice.productLines.forEach((productLine) => {
      const quantityNumber = parseFloat(productLine.quantity);
      const rateNumber = parseFloat(productLine.rate);
      const amount =
        quantityNumber && rateNumber ? quantityNumber * rateNumber : 0;

      subTotal += amount;
    });

    setSubTotal(subTotal);
  }, [invoice.productLines]);

  useEffect(() => {
    const match = invoice.taxLabel.match(/(\d+)%/);
    const taxRate = match ? parseFloat(match[1]) : 0;
    const saleTax = subTotal ? (subTotal * taxRate) / 100 : 0;

    setSaleTax(saleTax);
  }, [subTotal, invoice.taxLabel]);

  useEffect(() => {
    if (onChange) {
      onChange(invoice);
    }
  }, [onChange, invoice]);

  const handleShippingChange = (
    name: keyof typeof shippingDetails,
    value: string
  ) => {
    setShippingDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

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
                onChangeImage={(value) => handleChange("logo", value)}
                onChangeWidth={(value) => handleChange("logoWidth", value)}
              />

              <div className="mt-20">
                <div className="">
                  <View className="bold underline" pdfMode={pdfMode}>
                    Seller Details:
                  </View>
                  <EditableInput
                    className="border"
                    placeholder="Sold By"
                    value={invoice.companyName}
                    onChange={(value) => handleChange("companyName", value)}
                    pdfMode={pdfMode}
                  />
                  <EditableInput
                    className="border"
                    placeholder="Your Name"
                    value={invoice.name}
                    onChange={(value) => handleChange("name", value)}
                    pdfMode={pdfMode}
                  />
                  <EditableInput
                    className="border"
                    placeholder="Company's Address"
                    value={invoice.companyAddress}
                    onChange={(value) => handleChange("companyAddress", value)}
                    pdfMode={pdfMode}
                  />
                  <EditableInput
                    className="border"
                    placeholder="City, State, Pincode"
                    value={invoice.companyAddress2}
                    onChange={(value) => handleChange("companyAddress2", value)}
                    pdfMode={pdfMode}
                  />
                </div>
                <div className="mt-10">
                  <View className="semi-bold" pdfMode={pdfMode}>
                    PAN NO.
                  </View>
                  <EditableInput
                    className="border"
                    placeholder="pan no."
                    value={invoice.PANNo}
                    onChange={(value) => handleChange("PANNo", value)}
                    pdfMode={pdfMode}
                  />
                  <View className="semi-bold mt-2" pdfMode={pdfMode}>
                    GST Registration No.
                  </View>
                  <EditableInput
                    className="border"
                    placeholder="gst no.."
                    value={invoice.GSTRegistrationNo}
                    onChange={(value) =>
                      handleChange("GSTRegistrationNo", value)
                    }
                    pdfMode={pdfMode}
                  />
                </div>
              </div>

              <div className="mt-5">
                <View className="bold" pdfMode={pdfMode}>
                  Place Of Supply:
                </View>
                <EditableInput
                  className="border"
                  placeholder="Place of Supply"
                  value={invoice.placeOfSupply}
                  onChange={(value) => handleChange("placeOfSupply", value)}
                  pdfMode={pdfMode}
                />
              </div>

              <div className="mt-10">
                <View className="bold underline " pdfMode={pdfMode}>
                  Billing Details:
                </View>
                <EditableInput
                  className="border"
                  placeholder="Recipient's Name"
                  value={invoice.clientName}
                  onChange={(value) => handleChange("clientName", value)}
                  pdfMode={pdfMode}
                />
                <EditableInput
                  className="border"
                  placeholder="Client's Address"
                  value={invoice.clientAddress}
                  onChange={(value) => handleChange("clientAddress", value)}
                  pdfMode={pdfMode}
                />
                <EditableInput
                  className="border"
                  placeholder="City, State, Pincode"
                  value={invoice.clientAddress2}
                  onChange={(value) => handleChange("clientAddress2", value)}
                  pdfMode={pdfMode}
                />
                <EditableInput
                  className="border"
                  placeholder="State/UT Code"
                  value={invoice.clientStateUTCode}
                  onChange={(value) => handleChange("clientStateUTCode", value)}
                  pdfMode={pdfMode}
                />
              </div>

              <div className="mt-20">
                <View className="bold" pdfMode={pdfMode}>
                  Shipping Details:
                </View>
                <EditableInput
                  className="border"
                  placeholder="Recipient's Name"
                  value={shippingDetails.recipientName}
                  onChange={(value) =>
                    handleShippingChange("recipientName", value)
                  }
                  pdfMode={pdfMode}
                />
                <EditableInput
                  className="border"
                  placeholder="Shipping Address"
                  value={shippingDetails.address}
                  onChange={(value) => handleShippingChange("address", value)}
                  pdfMode={pdfMode}
                />
                <EditableInput
                  className="border"
                  placeholder="City, State, Pincode"
                  value={shippingDetails.cityStatePin}
                  onChange={(value) =>
                    handleShippingChange("cityStatePin", value)
                  }
                  pdfMode={pdfMode}
                />
                <EditableInput
                  className="border"
                  placeholder="State/UT Code"
                  value={shippingDetails.stateUTCode}
                  onChange={(value) =>
                    handleShippingChange("stateUTCode", value)
                  }
                  pdfMode={pdfMode}
                />
              </div>
            </View>

            <View className="w-50" pdfMode={pdfMode}>
              <EditableInput
                className="fs-45 right bold"
                placeholder="Invoice"
                value={invoice.title}
                onChange={(value) => handleChange("title", value)}
                pdfMode={pdfMode}
              />

              <div className=" w-48 ml-40 mt-10">
                <View className="right semi-bold underline " pdfMode={pdfMode}>
                  Invoice No.
                  <EditableInput
                    className="border w-100 right"
                    placeholder="Invoice No."
                    value={invoice.invoiceNumber}
                    onChange={(value) => handleChange("invoiceNumber", value)}
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

                <View className="right  semi-bold underline" pdfMode={pdfMode}>
                  Reference No
                  <EditableInput
                    className="border w-100 right"
                    placeholder="Reference No."
                    value={invoice.referenceNumber}
                    onChange={(value) => handleChange("referenceNumber", value)}
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
              </div>

              <div className="mt-40  ">
                <View className="w-40 ml-40 right underline" pdfMode={pdfMode}>
                  Account No.
                  <EditableInput
                    className="bold w-100 right border"
                    placeholder="Account Number "
                    value={invoice.accountNumber}
                    onChange={(value) => handleChange("accountNumber", value)}
                    pdfMode={pdfMode}
                  />
                </View>
                <View className="w-40 ml-40 right underline" pdfMode={pdfMode}>
                  Payment Terms
                  <EditableInput
                    className="bold w-100 right border  "
                    placeholder="Payment Terms"
                    value={invoice.paymentTerms}
                    onChange={(value) => handleChange("paymentTerms", value)}
                    pdfMode={pdfMode}
                  />
                </View>
              </div>
            </View>
          </View>

          <View className="mt-20" pdfMode={pdfMode}>
            <EditableInput
              className="w-100"
              placeholder="Description"
              value={invoice.description}
              onChange={(value) => handleChange("description", value)}
              pdfMode={pdfMode}
            />
          </View>

          <View className="mt-20 border" pdfMode={pdfMode}>
            <View className="flex bg-gray  p-4" pdfMode={pdfMode}>
              <Text className="w-48 bold">Product Description</Text>
              <Text className="w-17 bold">Unit Price</Text>
              <Text className="w-10 bold right">Quantity</Text>
              <Text className="w-10 bold right">Discount</Text>
              <Text className="w-15 bold right">Net Amount </Text>
            </View>

            {invoice.productLines.map((productLine, i) => (
              <View key={i} className="flex p-4" pdfMode={pdfMode}>
                <View className="w-48 pb-4" pdfMode={pdfMode}>
                  <EditableTextarea
                    placeholder="Enter item name/description"
                    value={productLine.description}
                    onChange={(value) =>
                      handleProductLineChange(i, "description", value)
                    }
                    pdfMode={pdfMode}
                  />
                </View>
                <View className="w-17 pb-4" pdfMode={pdfMode}>
                  <EditableInput
                    placeholder="Unit "
                    value={productLine.HSNSAC}
                    onChange={(value) =>
                      handleProductLineChange(i, "HSNSAC", value)
                    }
                    pdfMode={pdfMode}
                  />
                </View>
                <View className="w-10 pb-4" pdfMode={pdfMode}>
                  <EditableInput
                    className="right"
                    value={productLine.quantity}
                    onChange={(value) =>
                      handleProductLineChange(i, "quantity", value)
                    }
                    pdfMode={pdfMode}
                  />
                </View>
                <View className="w-10 pb-4" pdfMode={pdfMode}>
                  <EditableInput
                    className="right"
                    value={productLine.rate}
                    onChange={(value) =>
                      handleProductLineChange(i, "rate", value)
                    }
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
              <View className="flex mt-20 border w-25 m ">
                <button className="link " onClick={handleAdd}>
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
                  onChange={(value) => handleChange("notes", value)}
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
                      onChange={(value) => handleChange("taxLabel", value)}
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
          <div className="">
          <View className=" bold" pdfMode={pdfMode}> 
          Seller Name :
            <View className="w-50  " pdfMode={pdfMode}>
              <EditableFileImage
                className="flex "
                placeholder="Your Signature"
                value={invoice.sign}
                width={invoice.signWidth}
                pdfMode={pdfMode}
                onChangeImage={(value) => handleChange("sign", value)}
                onChangeWidth={(value) => handleChange("signWidth", value)}
              />
              Autorised Signatory
            </View>
          </View>
          </div>
        </div>
      </Page>
    </Document>
  );
};

export default InvoicePage;
