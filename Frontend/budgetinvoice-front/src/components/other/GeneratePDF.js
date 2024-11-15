import React, { Fragment, useEffect, useState } from 'react'
import { Image, Text, View, Page, Document, StyleSheet } from '@react-pdf/renderer';
import logo from '../../assets/images/logo.png';
import { format } from 'date-fns';
import es from 'date-fns/locale/es';

const GeneratePDF = React.memo(({ document, doc_type, client, doc_number }) => {

  const [partidas, setPartidas] = useState([{ title: '', entries: [{ text: '', price: 0 }] }]);
  const [notes, setNotes] = useState([]);
  const [date, setDate] = useState([]);
  const [rendered, setRendered] = useState(false);
  const [totalWitVat, setTotalWithVat] = useState(0);
  const [vatTotal, setVatTotal] = useState(0);

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

      if (Array.isArray(document.data.notes)) {
        const filteredNotes = document.data.notes.filter(note => note.trim() !== '');
        setNotes(filteredNotes);
      } else {
        setNotes([]);
      }

      const formattedDate = document.date ? format(document.date, 'dd/MM/yyyy', { locale: es }) : '';
      setDate(formattedDate);
      setRendered(true);

      const floatAmount = parseFloat(document.price);
      const floatVat = parseFloat(document.vat);
      const vat_total = (floatAmount * floatVat) / 100;
      setVatTotal(vat_total.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      setTotalWithVat((floatAmount + vat_total).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    }

  });

  const formatNumber = (value) => {
    const floatValue = parseFloat(value);
    return floatValue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

    //tableTotal : { width: '80%', flexDirection: 'row', justifyContent:'flex-end', textAlign:'right'},
    tableTotal: { width: '100%', flexDirection: 'row', justifyContent: 'flex-end', textAlign: 'center', backgroundColor: '#DEDEDE', fontWeight: 'bold', borderColor: 'black', borderWith: 1 },

    tbody3: { fontSize: 9, paddingTop: 4, paddingLeft: 3, flex: 1, borderColor: 'whitesmoke', borderRightWidth: 1, borderBottomWidth: 1 },

    //footer: { position:'absolute', marginTop: 20, fontSize: 10, fontWeight: 'bold' },
    footer: { position: 'absolute', bottom: 0, left: 40, right: 40, textAlign: 'left', fontWeight: 'bold', padding: 10, fontSize: 10, backgroundColor: '#DEDEDE', borderColor: 'whitesmoke', flexDirection: 'column', borderWith: 1, width: 'auto', marginVertical: 10 },

    noteContainer: { backgroundColor: '#DEDEDE', borderWith: 1, padding: 10, marginVertical: 10, width: 'auto' },
    noteTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
    note: { marginTop: 2 },
    separator: { borderColor: 'whitesmoke', borderBottomWith: 1, marginVertical: 10, width: '100%' },

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
    //TODO: Generar id a partir de la fecha.
    <View style={styles.titleContainer}>
      <View style={styles.spaceBetween}>
        <View>
          <Text style={styles.document}>{doc_type === "invoice" ? "Factura" : "Presupuesto"} {doc_number}</Text>
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

  const B = (props) => <Text style={{fontWeight: 'bold'}}>{props.children}</Text>

  const formatText = (text) => {
    const parts = text.split(/(\*.*?\*)/g); // Dividir el texto por los asteriscos
    return parts.map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        const boldText = part.slice(1, -1); // Eliminar los asteriscos
        return <Text key={index} style={{ fontWeight: 'bold', fontStyle: 'italic', color: '#000' }}>{boldText}</Text>;
      }
      return <Text key={index}>{part}</Text>; // Texto normal
    });
  };

  const TableBody = () => (
    partidas.map((partida, index) => (
      <Fragment key={index}>
        {partida.title && (
          <Text style={styles.partidaTitle}>{partida.title}</Text>
        )}
        {partida.entries.map((entry, entryIndex) => (
          <View key={entryIndex} style={{ width: '100%', flexDirection: 'row' }}>
            <View style={[styles.tbody, styles.tbody2]}>
              <Text style={{ flexDirection: 'row'}}>
                {formatText(entry.text)}
              </Text>
            </View>
            <View style={styles.tbody}>
              <Text>{entry.price ? `${formatNumber(entry.price)}€` : ''}</Text>
            </View>
          </View>
        ))}
      </Fragment>
    ))
  );

  const TableTotal = () => {
    // Condición para determinar si se debe mostrar el subtotal, IVA y total
    const shouldShowTotals = parseFloat(document.price) > 0;
  
    return shouldShowTotals ? (
      <View style={styles.tableTotal}>
        <View style={styles.tbody3}>
          <Text>Subtotal</Text>
        </View>
        <View style={styles.tbody3}>
          <Text>{formatNumber(document.price)}€</Text>
        </View>
        {document.vat && (
          <>
            <View style={styles.tbody3}>
              <Text>IVA {document.vat}%</Text>
            </View>
            <View style={styles.tbody3}>
              <Text>{vatTotal}€</Text>
            </View>
          </>
        )}
        <View style={styles.tbody3}>
          <Text>Total</Text>
        </View>
        <View style={styles.tbody3}>
          <Text>{totalWitVat}€</Text>
        </View>
      </View>
    ) : null; // No renderizar nada si el total es 0
  };  

  const Footer = ({ notes, doc_type }) => (
    <View style={styles.footer}>
      <Text style={styles.noteTitle}>{Array.isArray(notes) && notes.length > 0 ? 'Notas' : ''}</Text>
      {notes && notes.map((note, index) => (
        <Text key={index} style={styles.note}>{note}</Text>
      ))}
      {Array.isArray(notes) && notes.length > 0 && <View style={styles.separator} />}
      <Text>{doc_type === "invoice" ? "Ingreso a la siguiente cuenta" : ""}</Text>
      <Text>{doc_type === "invoice" ? "ES63 0182 6240 62 0201590287" : ""}</Text>
    </View>
  );


  const PageTemplate = ({ children }) => (
    <Page size="A4" style={styles.page}>
      {children}
      <Footer notes={notes} doc_type={doc_type} />
    </Page>
  );

  return (
    <Document>
      <PageTemplate>
        <InvoiceTitle />
        <Address />
        <UserAddress />
        <TableHead />
        <TableBody />
        <TableTotal />
      </PageTemplate>
    </Document>
  );
}

);

export default GeneratePDF;