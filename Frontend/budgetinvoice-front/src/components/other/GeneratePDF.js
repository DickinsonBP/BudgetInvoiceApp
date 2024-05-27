import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
      flexDirection: 'row',
      backgroundColor: '#E4E4E4'
    },
    section: {
      margin: 10,
      padding: 10,
      flexGrow: 1
    }
});

const MyDocument = ({document}) => (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                <Text>Owner: {document.owner_name}</Text>
                <Text>NIF: {document.owner_nif}</Text>
                <Text>Phone: {document.owner_phone}</Text>
                <Text>Email: {document.owner_email}</Text>
                <Text>Client: {document.client_name}</Text>
                <Text>Address: {document.address}</Text>
                <Text>Description: {document.desc}</Text>
                <Text>Subtotal: {document.subtotal}€</Text>
                <Text>VAT: {document.vat}%</Text>
                <Text>Total: {document.total}€</Text>
                </View>
            </Page>

        </Document>
);

export default MyDocument;