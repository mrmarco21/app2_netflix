import * as React from "react";
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MiListaProvider } from './contextos/MiListaContext';
import { UsuarioProvider, useUsuario } from './contextos/UsuarioContext';
import Inicio from "./pantallas/Inicio";
import Login from "./pantallas/Login";
import Registro from "./pantallas/Registro";
import Perfiles from "./pantallas/Perfiles";
import InicioApp from "./pantallas/InicioApp";
import Buscar from "./pantallas/Buscar";
import Proximamente from "./pantallas/Proximamente";
import Descargas from "./pantallas/Descargas";
import MiNetflix from "./pantallas/MiNetflix";
import DetallePelicula from "./pantallas/DetallePelicula";
import CategoriaCompleta from "./pantallas/CategoriaCompleta"
import ModalCalificacion from "./componentes/ModalCalificacion";

// Importar la pantalla de prueba TMDB
import PantallaPruebaTMDB from "./pantallas/PantallaPruebaTMDB"
import NetflixIntro from "./pantallas/NetflixIntro";

const Stack = createNativeStackNavigator();

// Componente interno que tiene acceso al contexto
function AppNavigator() {
  const { sesionIniciada } = useUsuario();
  
  return (
    <Stack.Navigator
      initialRouteName={sesionIniciada ? "Perfiles" : "NetflixIntro"}
      screenOptions={{ 
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="NetflixIntro" component={NetflixIntro}/>
      <Stack.Screen name="Inicio" component={Inicio} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Registro" component={Registro} />
      <Stack.Screen name="Perfiles" component={Perfiles}/>
      <Stack.Screen name="InicioApp" component={InicioApp}/>
      <Stack.Screen name="Buscar" component={Buscar}/>
      <Stack.Screen name="Proximamente" component={Proximamente}/>
      <Stack.Screen name="Descargas" component={Descargas}/>
      <Stack.Screen name="MiNetflix" component={MiNetflix}/>
      <Stack.Screen name="DetallePelicula" component={DetallePelicula}/>
      <Stack.Screen name="CategoriaCompleta" component={CategoriaCompleta}/>
      <Stack.Screen name="ModalCalificacion" component={ModalCalificacion}/>
    </Stack.Navigator>
  );
}

export default function App() {
  const navigationRef = React.useRef();

  return (
    <UsuarioProvider>
      <MiListaProvider>
        <SafeAreaProvider>
        <StatusBar 
          barStyle="dark-content"  // ← CAMBIADO A dark-content
          backgroundColor="#d6d6d6ff"  // ← Color de fondo que coincida con tu gradiente
          translucent={false}
        />
        <NavigationContainer 
          ref={navigationRef}
          onStateChange={(state) => {
            const currentRoute = state?.routes[state.index];
            if (currentRoute?.name === 'Inicio' && state?.routes.length > 1) {
              navigationRef.current?.reset({
                index: 0,
                routes: [{ name: 'Inicio' }],
              });
            }
          }}
        >
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </MiListaProvider>
</UsuarioProvider>
  );
}