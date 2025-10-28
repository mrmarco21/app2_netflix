import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, KeyboardAvoidingView, ScrollView, BackHandler, Alert } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { loginUsuario } from '../servicios/apiUsuarios';
import { useUsuario } from '../contextos/UsuarioContext';


export default function Login({ navigation }) {
    const [correo, setCorreo] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [cargando, setCargando] = useState(false);
    
    const { establecerUsuario } = useUsuario();

    // Controla el botón de atrás del dispositivo
    useEffect(() => {
        const backAction = () => {
            navigation.navigate('Inicio');
            return true; // Previene el comportamiento por defecto
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, [navigation]);

    // Función para validar el formulario
    const validarFormulario = () => {
        if (!correo.trim()) {
            setMensaje('Por favor ingresa tu correo electrónico');
            return false;
        }
        if (!correo.includes('@')) {
            setMensaje('Por favor ingresa un correo electrónico válido');
            return false;
        }
        if (!contraseña.trim()) {
            setMensaje('Por favor ingresa tu contraseña');
            return false;
        }
        setMensaje(''); // limpia mensaje si todo está bien
        return true;
    };

    // Función para manejar el login
    const manejarLogin = async () => {
        if (!validarFormulario()) {
            return;
        }

        setCargando(true);
        setMensaje('');

        try {
            const resultado = await loginUsuario(correo, contraseña);

            if (resultado.success) {
                console.log('Éxito:', resultado.mensaje);

                // Establecer usuario en el contexto
                await establecerUsuario(resultado.data.usuario);

                // Limpiar formulario
                setCorreo('');
                setContraseña('');
                setMensaje('');

                // Navegar a la pantalla de perfiles pasando los datos del usuario
                navigation.navigate('Perfiles', { 
                    idUsuario: resultado.data.usuario.id 
                });
            } else {
                console.warn('Error:', resultado.mensaje);
                Alert.alert('Error', resultado.mensaje || 'Credenciales incorrectas');
            }
        } catch (error) {
            console.error('Error inesperado:', error);
            Alert.alert('Error', 'Error de conexión. Intenta nuevamente.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <SafeAreaView style={estilos.safeArea} edges={['top']}>
            <LinearGradient
                colors={['#b8b8b86a', '#1a1a1a', '#000000']}
                style={estilos.gradient}
            >
                {/* Header con botón de regreso */}
                <View style={estilos.header}>
                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate('Inicio');
                        }}
                        style={estilos.botonAtras}
                    >
                        <Ionicons name="arrow-back" size={25} color="#000000ff" />
                    </TouchableOpacity>
                    <Text style={estilos.nombreApp}>MiNetflix</Text>
                </View>

                {/* Contenedor del formulario con KeyboardAvoidingView */}
                <View style={estilos.contenedorPrincipal}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={estilos.keyboardView}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                    >
                        <ScrollView
                            contentContainerStyle={estilos.scrollContent}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={estilos.contenedorForm}>
                                <Text style={estilos.titulo}>INICIAR SESIÓN</Text>

                                <TextInput
                                    style={estilos.input}
                                    placeholder="Correo electrónico"
                                    placeholderTextColor="#aaa"
                                    value={correo}
                                    onChangeText={setCorreo}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />

                                <TextInput
                                    style={estilos.input}
                                    placeholder="Contraseña"
                                    placeholderTextColor="#aaa"
                                    secureTextEntry
                                    value={contraseña}
                                    onChangeText={setContraseña}
                                    autoCapitalize="none"
                                />
                                {/* Muestra el mensaje de error o validación */}
                                {mensaje !== '' && (
                                    <Text style={estilos.mensajeError}>
                                        {mensaje}
                                    </Text>
                                )}

                                <TouchableOpacity
                                    style={[estilos.boton, cargando && estilos.botonDeshabilitado]}
                                    onPress={manejarLogin}
                                    disabled={cargando}
                                >
                                    <Text style={estilos.textoBoton}>
                                        {cargando ? 'Ingresando...' : 'Ingresar'}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => navigation.navigate("Registro")} style={estilos.btnRegistrar}>
                                    <Text style={estilos.textoAlternativo}>
                                        ¿No tienes una cuenta?
                                    </Text>
                                    <Text style={estilos.texto2}>Regístrate</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}

const estilos = StyleSheet.create({
    safeArea: {
        marginTop: 0,
        flex: 1,
        // backgroundColor: '#ffffff2a', // Color del inicio del gradiente para que coincida
    },
    gradient: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingVertical: 15,
        width: '100%',
    },
    botonAtras: {
        padding: 10,
        marginRight: 10,
    },
    nombreApp: {
        color: "red",
        fontSize: 26,
        fontWeight: "bold",
    },
    contenedorPrincipal: {
        flex: 1,
        paddingHorizontal: 25,

    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    contenedorForm: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: '#00000080',
        borderRadius: 10,
        padding: 20,
        position: "absolute",
        top: 15
    },
    titulo: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 30,
        color: "#ffffff",
    },
    input: {
        width: "100%",
        backgroundColor: "#222",
        color: "white",
        paddingVertical: 16,
        paddingHorizontal: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#74747497',
        borderRadius: 6,
    },
    mensajeError: {
        color: "red",
        marginBottom: 15,
        fontSize: 14,
    },
    boton: {
        backgroundColor: "#E50914",
        padding: 12,
        borderRadius: 6,
        width: "100%",
        alignItems: "center",
        marginTop: 10,
    },
    botonDeshabilitado: {
        backgroundColor: "#666",
        opacity: 0.7,
    },
    textoBoton: {
        color: "white",
        fontSize: 18,
        fontWeight: "600",
    },
    btnRegistrar: {
        flexDirection: "row"
    },
    textoAlternativo: {
        color: "#cccccc",
        marginTop: 15,
        fontSize: 15
    },
    texto2: {
        color: "#cccccc",
        marginTop: 15,
        textDecorationLine: 'underline',
        marginLeft: 5,
        fontSize: 15
    }
});