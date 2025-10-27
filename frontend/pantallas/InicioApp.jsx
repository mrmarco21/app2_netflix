import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMiLista } from '../contextos/MiListaContext';
import { useUsuario } from '../contextos/UsuarioContext';

// Componentes modulares
import HeaderInicio from '../componentes/HeaderInicio';
import FiltrosInicio from '../componentes/FiltrosInicio';
import BannerDestacado from '../componentes/BannerDestacado';
import SeccionContenido from '../componentes/SeccionContenido';
import ModalCategorias from '../componentes/ModalCategorias';
import NavegacionInferior from '../componentes/NavegacionInferior';

export default function InicioApp({ navigation, route }) {
  const { perfil, idUsuario } = route.params || {};
  const [filtroActivo, setFiltroActivo] = useState('Inicio');
  const [modalVisible, setModalVisible] = useState(false);
  const [contenidoDestacado, setContenidoDestacado] = useState(null);
  const [continuarViendo, setContinuarViendo] = useState([]);
  const [secciones, setSecciones] = useState([]);
  
  const { toggleMiLista } = useMiLista();
  const { establecerUsuario, establecerPerfilActual } = useUsuario();

  // Establecer el usuario y perfil en el contexto global cuando se monta el componente
  useEffect(() => {
    if (idUsuario && perfil) {
      establecerUsuario({ id: idUsuario });
      establecerPerfilActual(perfil);
    }
  }, [idUsuario, perfil]);

  // Categorías para el modal
  const categorias = [
    'Inicio', 'Mi lista', 'Disponibles para descargar', 'Acción',
    'Aclamados por la crítica', 'Animes', 'Comedias', 'De Hollywood',
    'De Latinoamérica', 'Deportes', 'Documentales', 'Dramas',
    'Emmy® 2025 de Netflix'
  ];

  // Datos de ejemplo para el contenido destacado
  const contenidosDestacados = {
    'Inicio': {
      id: 1,
      titulo: 'DEATH NOTE',
      subtitulo: 'デスノート',
      imagen: 'https://via.placeholder.com/400x600/8B0000/FFFFFF?text=DEATH+NOTE',
      generos: ['Escalofriante', 'Complejo', 'Terror', 'Demonios', 'Serie'],
      descripcion: 'Un estudiante encuentra un cuaderno sobrenatural que le permite matar a cualquier persona escribiendo su nombre.'
    },
    'Series': {
      id: 2,
      titulo: 'STRANGER THINGS',
      imagen: 'https://via.placeholder.com/400x600/000080/FFFFFF?text=STRANGER+THINGS',
      generos: ['Ciencia ficción', 'Terror', 'Drama', 'Serie'],
      descripcion: 'Un grupo de niños se enfrenta a fuerzas sobrenaturales en su pequeño pueblo.'
    },
    'Películas': {
      id: 3,
      titulo: 'THE WITCHER',
      imagen: 'https://via.placeholder.com/400x600/4B0082/FFFFFF?text=THE+WITCHER',
      generos: ['Fantasía', 'Aventura', 'Drama', 'Película'],
      descripcion: 'Geralt de Rivia, un cazador de monstruos mutado, lucha por encontrar su lugar en un mundo donde las personas a menudo resultan más malvadas que las bestias.'
    }
  };

  // Datos de ejemplo para "Continuar viendo"
  const ejemploContinuarViendo = [
    { id: 1, titulo: 'Death Note', imagen: 'https://via.placeholder.com/150x200/8B0000/FFFFFF?text=DEATH+NOTE', progreso: 0.65 },
    { id: 2, titulo: 'Stranger Things', imagen: 'https://via.placeholder.com/150x200/000080/FFFFFF?text=STRANGER+THINGS', progreso: 0.30 },
    { id: 3, titulo: 'The Witcher', imagen: 'https://via.placeholder.com/150x200/4B0082/FFFFFF?text=THE+WITCHER', progreso: 0.85 },
    { id: 4, titulo: 'Breaking Bad', imagen: 'https://via.placeholder.com/150x200/228B22/FFFFFF?text=BREAKING+BAD', progreso: 0.45 }
  ];

  // Datos de ejemplo para las secciones
  const ejemploSecciones = [
    {
      titulo: 'Tendencias ahora',
      contenido: [
        { id: 1, titulo: 'Death Note', imagen: 'https://via.placeholder.com/150x200/8B0000/FFFFFF?text=DEATH+NOTE', etiqueta: 'N°1 en series hoy' },
        { id: 2, titulo: 'Stranger Things', imagen: 'https://via.placeholder.com/150x200/000080/FFFFFF?text=STRANGER+THINGS' },
        { id: 3, titulo: 'The Witcher', imagen: 'https://via.placeholder.com/150x200/4B0082/FFFFFF?text=THE+WITCHER' },
        { id: 4, titulo: 'Breaking Bad', imagen: 'https://via.placeholder.com/150x200/228B22/FFFFFF?text=BREAKING+BAD' },
        { id: 5, titulo: 'Narcos', imagen: 'https://via.placeholder.com/150x200/DC143C/FFFFFF?text=NARCOS' }
      ]
    },
    {
      titulo: 'Mi lista',
      contenido: [
        { id: 1, titulo: 'Casa de papel', imagen: 'https://via.placeholder.com/150x200/FF6347/FFFFFF?text=CASA+PAPEL' },
        { id: 2, titulo: 'Dark', imagen: 'https://via.placeholder.com/150x200/2F4F4F/FFFFFF?text=DARK' },
        { id: 3, titulo: 'Ozark', imagen: 'https://via.placeholder.com/150x200/1E90FF/FFFFFF?text=OZARK' },
        { id: 4, titulo: 'Mindhunter', imagen: 'https://via.placeholder.com/150x200/8B4513/FFFFFF?text=MINDHUNTER' }
      ]
    },
    {
      titulo: 'Recién agregados',
      contenido: [
        { id: 1, titulo: 'Wednesday', imagen: 'https://via.placeholder.com/150x200/800080/FFFFFF?text=WEDNESDAY', etiqueta: 'Nuevo' },
        { id: 2, titulo: 'Glass Onion', imagen: 'https://via.placeholder.com/150x200/FFD700/FFFFFF?text=GLASS+ONION', etiqueta: 'Nuevo' },
        { id: 3, titulo: 'The Crown', imagen: 'https://via.placeholder.com/150x200/B8860B/FFFFFF?text=THE+CROWN' },
        { id: 4, titulo: 'Enola Holmes', imagen: 'https://via.placeholder.com/150x200/CD853F/FFFFFF?text=ENOLA+HOLMES' },
        { id: 5, titulo: 'El genio y los deseos', imagen: 'https://via.placeholder.com/150x200/9370DB/FFFFFF?text=GENIO', etiqueta: 'Recién agregado' },
        { id: 6, titulo: 'Fatalidad al servicio', imagen: 'https://via.placeholder.com/150x200/FF1493/FFFFFF?text=FATALIDAD' },
        { id: 7, titulo: 'Nueve colas', imagen: 'https://via.placeholder.com/150x200/20B2AA/FFFFFF?text=NUEVE+COLAS' },
        { id: 8, titulo: 'Algo sobre nosotros', imagen: 'https://via.placeholder.com/150x200/4169E1/FFFFFF?text=ALGO+NOSOTROS' }
      ]
    }
  ];

  useEffect(() => {
    // Cargar contenido inicial
    setContenidoDestacado(contenidosDestacados[filtroActivo] || contenidosDestacados['Inicio']);
    setContinuarViendo(ejemploContinuarViendo);
    setSecciones(ejemploSecciones);
  }, [filtroActivo]);

  const handleBuscarPress = () => {
    navigation.navigate('Buscar');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent={false} />
      
      <HeaderInicio 
        filtroActivo={filtroActivo} 
        onPressBuscar={() => navigation.navigate('Buscar')}
      />

      <FiltrosInicio 
        filtroActivo={filtroActivo}
        setFiltroActivo={setFiltroActivo}
        setModalVisible={setModalVisible}
      />

      <ScrollView style={styles.scrollContainer}>
        <BannerDestacado 
          contenidoDestacado={contenidoDestacado} 
          onAgregarAMiLista={toggleMiLista}
        />

        {continuarViendo.length > 0 && (
          <SeccionContenido 
            titulo="Continuar viendo" 
            contenido={continuarViendo}
            esContinuarViendo={true}
            onAgregarAMiLista={toggleMiLista}
          />
        )}

        {secciones.map((seccion, index) => (
          <SeccionContenido 
            key={index}
            titulo={seccion.titulo}
            contenido={seccion.contenido}
            onAgregarAMiLista={toggleMiLista}
          />
        ))}
      </ScrollView>

      <NavegacionInferior navigation={navigation} activeTab="Inicio" />

      <ModalCategorias 
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        categorias={categorias}
        setFiltroActivo={setFiltroActivo}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContainer: {
    flex: 1,
  },
});