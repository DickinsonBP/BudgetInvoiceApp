import React, { Fragment, useEffect, useState } from 'react'
import { Image, Text, View, Page, Document, StyleSheet, renderToFile } from '@react-pdf/renderer';
import logo from '../../assets/images/logo.png';

const GeneratePDF = ({document, doc_type}) => {

  const [partidas, setPartidas] = useState([{ title: '', entries: [{ text: '', price: 0 }] }]);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
      if(document && document.data){
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
      }

  });

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

    document: { fontWeight: 'bold', fontSize: 20 },

    invoiceNumber: { fontSize: 11, fontWeight: 'bold' },

    address: { fontWeight: 400, fontSize: 10 },

    theader: { marginTop: 20, fontSize: 10, fontStyle: 'bold', paddingTop: 4, paddingLeft: 7, flex: 1, height: 20, backgroundColor: '#DEDEDE', borderColor: 'whitesmoke', borderRightWidth: 1, borderBottomWidth: 1 },

    theader2: { flex: 2, borderRightWidth: 0, borderBottomWidth: 1 },

    tbody: { fontSize: 9, paddingTop: 4, paddingLeft: 7, flex: 1, borderColor: 'whitesmoke', borderRightWidth: 1, borderBottomWidth: 1 },

    total: { fontSize: 9, paddingTop: 4, paddingLeft: 7, flex: 1.5, borderColor: 'whitesmoke', borderBottomWidth: 1 },

    tbody2: { flex: 2, borderRightWidth: 1, },

    footer: { marginTop: 20, fontSize: 10, fontWeight: 'bold'},

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

  const Address = () => (
    <View style={styles.titleContainer}>
      <View style={styles.spaceBetween}>
        <View>
          <Text style={styles.document}>{doc_type === "invoice" ? "Factura" : "Presupuesto"} </Text>
          <Text style={styles.invoiceNumber}>Numero: {document.id} </Text>
        </View>
      </View>
    </View>
  );

  const UserAddress = () => (
    <View style={styles.titleContainer}>
      <View style={styles.spaceBetween}>
        <View style={{ maxWidth: 200 }}>
          <Text style={styles.address}>{document.client ? document.client.name : 'Sin datos de cliente'}</Text>
          <Text style={styles.address}>{document.client ? document.client.nif : 'Sin datos de cliente'}</Text>
          <Text style={styles.address}>{document.client ? document.client.address : 'Sin datos de cliente'}</Text>
        </View>
        <Text style={styles.addressTitle}>Fecha: {document.date}</Text>
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
              <Text>{entry.price}</Text>
            </View>
          </View>
        ))}
      </Fragment>
    ))
  );

  const TableTotal = () => (
    <View style={{ width: '100%', flexDirection: 'row' }}>
      <View style={styles.total}>
        <Text></Text>
      </View>
      <View style={styles.total}>
        <Text> </Text>
      </View>
      <View style={styles.tbody}>
        <Text>Total</Text>
      </View>
      <View style={styles.tbody}>
        <Text>{document.price}</Text>
      </View>
    </View>
  );

  const Footer = () => (
    <View style={styles.footer}>
      {notes && notes.map((note, index) => (
        <Text key={index} style={styles.note}>{note.text}</Text>
      ))}
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
};

export default GeneratePDF;