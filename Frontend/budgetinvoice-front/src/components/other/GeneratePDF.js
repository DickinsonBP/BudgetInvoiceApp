import React, { Fragment, useEffect, useState } from 'react'
import { Image, Text, View, Page, Document, StyleSheet } from '@react-pdf/renderer';
import logo from '../../assets/images/logo.png';
import { format } from 'date-fns';
import es from 'date-fns/locale/es';

const GeneratePDF = React.memo(({ document, doc_type, client }) => {

  const [partidas, setPartidas] = useState([{ title: '', entries: [{ text: '', price: 0 }] }]);
  const [notes, setNotes] = useState([]);
  const [date, setDate] = useState(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (!rendered && document && document.data) {
      const formattedPartidas = Object.keys(document.data).map((key) => {
        const partida = document.data[key];
        return {
          title: partida.title,
          entries: Array.isArray(partida.entries) ? partida.entries.map((entry) => ({
            text: entry.text,
            price: entry.price
          })) : []
        };
      });
      setPartidas(formattedPartidas);

      if (document.data.notes) {
        // setNotes(Array.isArray(document.data.notes) ? document.data.notes.map(note => ({ text: note })) : []);
        setNotes(document.data.notes);
      } else {
        setNotes([]);
      }
      const formattedDate = document.date ? format(document.date, 'dd/MM/yyyy', { locale: es }) : '';
      setDate(formattedDate);
      setRendered(true);
    }

  });

  const formatNumber = (value) => {
    const floatValue = parseFloat(value);
    return floatValue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  const calculateTotal = (amout, vat) => {
    const floatAmount = parseFloat(amout);
    const floatVat = parseFloat(vat);
    const result = floatAmount + ((floatAmount * floatVat) / 100);
    return result.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  }

  const styles = StyleSheet.create({
    page: { fontSize: 11, paddingTop: 20, paddingLeft: 40, paddingRight: 40, lineHeight: 1.5, flexDirection: 'column' },

    spaceBetween: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', color: "#3E3E3E" },

    titleContainer: { flexDirection: 'row', marginTop: 24 },

    logoAndTitle: { flexDirection: 'column', alignItems: 'center' },

    logo: { width: 70 },

    reportTitle: { fontSize: 16, textAlign: 'center' },

    ownerData: { fontSize: 9, textAlign: 'center' },

    addressTitle: { fontSize: 11, fontStyle: 'bold' },

    partidaTitle: { fontSize: 10, fontWeight: 'bold', marginTop: 10, marginBottom: 4 },

    document: { fontWeight: 'bold', fontSize: 15 },

    invoiceNumber: { fontSize: 11, fontWeight: 'bold' },

    address: { fontWeight: 400, fontSize: 10 },

    theader: { marginTop: 20, fontSize: 10, fontStyle: 'bold', paddingTop: 4, paddingLeft: 7, flex: 1, height: 20, backgroundColor: '#DEDEDE', borderColor: 'whitesmoke', borderRightWidth: 1, borderBottomWidth: 1 },

    theader2: { flex: 2, borderRightWidth: 0, borderBottomWidth: 1 },

    tbody: { fontSize: 9, paddingTop: 4, paddingLeft: 7, flex: 1, borderColor: 'whitesmoke', borderRightWidth: 1, borderBottomWidth: 1 },
    
    total: { fontSize: 9, paddingTop: 4, paddingLeft: 7, flex: 1.5, borderColor: 'whitesmoke', borderBottomWidth: 1 },
    
    tbody2: { flex: 2, borderRightWidth: 1, },

    tableTotal : { width: '80%', flexDirection: 'row', justifyContent:'flex-end', textAlign:'right'},

    tbody3: { fontSize: 9, paddingTop: 4, paddingLeft: 3, flex: 1, borderColor: 'whitesmoke', borderRightWidth: 1, borderBottomWidth: 1 },

    footer: { marginTop: 20, fontSize: 10, fontWeight: 'bold' },

    note: { marginTop: 5 }

  });

  const InvoiceTitle = () => (
    <View style={styles.titleContainer}>
      <View style={styles.logoAndTitle}>
        <Image style={styles.logo} src={logo} />
        <Text style={styles.reportTitle}>Servicios Bedoya</Text>
        <Text style={styles.ownerData}>Omar de Jesús Bedoya Orrego</Text>
        <Text style={styles.ownerData}>55486382D · 687311861 · serviciosbedoya@hotmail.com</Text>
        <Text style={styles.ownerData}>Plaça Jacint Verdaguer 10, 3-1, 43003, Tarragona</Text>
      </View>
    </View>
  );

  const calculateId = (docId) => {
    const newId = String(docId).padStart(3,'0');
    const date = String(new Date().getFullYear());
    const onlyYear = date.substring(date.length - 2);

    return `${onlyYear}${newId}`;
  }

  const Address = () => (
    //TODO: Generar id a partir de la fecha.
    <View style={styles.titleContainer}>
      <View style={styles.spaceBetween}>
        <View>
          <Text style={styles.document}>{doc_type === "invoice" ? "Factura" : "Presupuesto"} {calculateId(document.id)}</Text>
        </View>
      </View>
    </View>
  );

  const UserAddress = () => (
    //TODO: Obtener los datos del cliente
    <View style={styles.titleContainer}>
      <View style={styles.spaceBetween}>
        <View style={{ maxWidth: 200 }}>
          <Text style={styles.address}>{client ? client.name : 'Sin datos de cliente'}</Text>
          <Text style={styles.address}>{client ? client.nif : 'Sin datos de cliente'}</Text>
          <Text style={styles.address}>{client ? client.address : 'Sin datos de cliente'}</Text>
        </View>
        <Text style={styles.addressTitle}>Fecha: {date}</Text>
      </View>
    </View>
  );


  const TableHead = () => (
    <View style={{ width: '100%', flexDirection: 'row', marginTop: 10 }}>
      <View style={[styles.theader, styles.theader2]}>
        <Text >Descripción</Text>
      </View>
      <View style={styles.theader}>
        <Text>Importe</Text>
      </View>
    </View>
  );


  const TableBody = () => (
    partidas.map((partida, index) => (
      <Fragment key={index}>
        {partida.title && (
          <Text style={styles.partidaTitle}>{partida.title}</Text>
        )}
        {partida.entries.map((entry, entryIndex) => (
          <View key={entryIndex} style={{ width: '100%', flexDirection: 'row' }}>
            <View style={[styles.tbody, styles.tbody2]}>
              <Text>{entry.text}</Text>
            </View>
            <View style={styles.tbody}>
              <Text>{formatNumber(entry.price)}€</Text>
            </View>
          </View>
        ))}
      </Fragment>
    ))
  );

  

  const TableTotal = () => (
    <View style={styles.tableTotal}>
      <View style={styles.tbody3}>
        <Text>Subtotal</Text>
      </View>
      <View style={styles.tbody3}>
        <Text>{formatNumber(document.price)}€</Text>
      </View>
      <View style={styles.tbody3}>
        <Text>IVA</Text>
      </View>
      <View style={styles.tbody3}>
        <Text>{document.vat}%</Text>
      </View>
      <View style={styles.tbody3}>
        <Text>Total</Text>
      </View>
      <View style={styles.tbody3}>
        <Text>{calculateTotal(document.price, document.vat)}€</Text>
      </View>
    </View>
  );

  const Footer = () => (
    <View style={styles.footer}>
      {notes && notes.map((note, index) => (
        <Text key={index} style={styles.note}>{note.text}</Text>
      ))}
      <Text>{doc_type === "invoice" ? "Ingreso a la siguiente cuenta" : ""}</Text>
      <Text>{doc_type === "invoice" ? "ES63 0182 6240 62 0201590287" : ""}</Text>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <InvoiceTitle />
        <Address />
        <UserAddress />
        <TableHead />
        <TableBody />
        <TableTotal />
        <Footer />
      </Page>
    </Document>
  );
}

);

export default GeneratePDF;