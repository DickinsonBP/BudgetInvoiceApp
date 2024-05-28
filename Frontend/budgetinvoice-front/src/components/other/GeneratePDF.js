import React, {useState, useEffect} from 'react';
import { getClientByID } from '../../services/api';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import SBlogo from '../../assets/images/logo.png';
import Montserrat from '@fontsource/montserrat';

// Font.register({
//   family : 'Montserrat',
//   src: 'https://fonts.googleapis.com/css2?family=Montserrat',
// });

const owner = {
  name: 'Omar de Jesús Bedoya Orrego',
  nif: '55486382D',
  phone: '687311861',
  email: 'serviciosbedoya@hotmail.com',
  address:'Plaça Jacint Verdaguer 10, 3-1, 43003, Tarragona'
}

const styles = StyleSheet.create({
  page: {fontSize: '12pt'},
  owner_data: { textAlign: 'start', margin: 30 },
  logoImage: { width: 80, height: 80 },
  section: { textAlign: 'center', margin: 30 }
});

const GeneratePDF = ({ document }) => {
  const [clientData, setClientData] = useState(null);
  const [partidas, setPartidas] = useState([{ title: '', entries: [{ text: '', price: 0 }] }]);
  const [notes, setNotes] = useState([{text:''}]);
  const { title = '', client = '', price = 0 } = document;
  
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const c = await getClientByID(client);
        setClientData(c);
        // console.log(data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };
    const fecthData = async () =>{
      try {
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
          setNotes(Array.isArray(document.data.notes) ? document.data.notes.map(note => ({ text: note })) : []);
          } else {
              setNotes([{ text: '' }]);
          }
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };
    fetchClient();
    fecthData();
  }, []);


  return (
      <Document>
          <Page size="A4" style={styles.page}>
              <View style={styles.owner_data}>
                <Image style={styles.logoImage} src={SBlogo} />
                <Text>{owner.name}</Text>
                <Text>{owner.nif}</Text>
                <Text>{owner.email}</Text>
                <Text>{owner.phone}</Text>
                <Text>{owner.address}</Text>
              </View>
              <View style={styles.section}>
                <Text>Cliente: {clientData ? clientData.name : 'Cargando...'}</Text>
              </View>
              <View style={styles.section}>
                  <Text>Precio: {price}€</Text>
              </View>
              {partidas.map((partida, index) => (
                  <View key={index} style={styles.section}>
                      <Text>{partida.title}</Text>
                      {partida.entries.map((entry, entryIndex) => (
                          <View key={entryIndex} style={styles.section}>
                              <Text>Texto: {entry.text}</Text>
                              <Text>Precio: {entry.price} €</Text>
                          </View>
                      ))}
                  </View>
              ))}
              <View style={styles.section}>
                  <Text>Notas:</Text>
                  {notes.map((note, index) => (
                      <Text key={index}>{note.text}</Text>
                  ))}
              </View>
          </Page>
      </Document>
  );
};

export default GeneratePDF;