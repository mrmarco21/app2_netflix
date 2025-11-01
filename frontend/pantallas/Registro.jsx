import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, KeyboardAvoidingView, ScrollView, BackHandler, Alert } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { registrarUsuario, crearPerfil } from '../servicios/apiUsuarios';
import { useUsuario } from '../contextos/UsuarioContext';

export default function Registro({ navigation }) {
    const [nombre, setNombre] = useState("");
    const [correo, setCorreo] = useState("");
    const [contraseña, setContraseña] = useState("");
    const [cargando, setCargando] = useState(false);
    const [mostrarContrasena, setMostrarContrasena] = useState(false);
    const { establecerUsuario } = useUsuario();

    // Mensaje para mostrar en pantalla (reemplaza los Alert)
    const [mensaje, setMensaje] = useState("");
    const [tipoMensaje, setTipoMensaje] = useState(""); // "error" o "exito"

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
        if (!nombre.trim()) {
            setMensaje("Por favor ingresa tu nombre completo");
            setTipoMensaje("error");
            return false;
        }
        if (!correo.trim()) {
            setMensaje("Por favor ingresa tu correo electrónico");
            setTipoMensaje("error");
            return false;
        }
        if (!correo.includes('@')) {
            setMensaje("Por favor ingresa un correo electrónico válido");
            setTipoMensaje("error");
            return false;
        }
        if (!contraseña.trim()) {
            setMensaje("Por favor ingresa una contraseña");
            setTipoMensaje("error");
            return false;
        }
        if (contraseña.length < 5) {
            setMensaje("La contraseña debe tener al menos 5 caracteres");
            setTipoMensaje("error");
            return false;
        }
        setMensaje("");
        return true;
    };

    // Manejar registro
    const manejarRegistro = async () => {
        if (!validarFormulario()) return;
        setCargando(true);
        setMensaje("");

        try {
            console.log('📝 Iniciando registro de usuario...');
            const resultado = await registrarUsuario(nombre, correo, contraseña);

            if (resultado.success) {
                console.log('✅ Usuario registrado exitosamente:', resultado.data.usuario.nombres);
                
                // Crear perfil por defecto inmediatamente después del registro
                try {
                    console.log('👤 Creando perfil por defecto...');
                    const perfilPorDefecto = await crearPerfil(nombre, resultado.data.usuario.id);
                    
                    if (perfilPorDefecto.success) {
                        console.log('✅ Perfil por defecto creado:', perfilPorDefecto.data.perfil.nombre);
                    } else {
                        console.warn('⚠️ No se pudo crear el perfil por defecto:', perfilPorDefecto.mensaje);
                        // No mostramos error al usuario ya que puede crear el perfil después
                    }
                } catch (errorPerfil) {
                    console.warn('⚠️ Error al crear perfil por defecto:', errorPerfil);
                    // No mostramos error al usuario ya que puede crear el perfil después
                }
                
                setMensaje(resultado.mensaje);
                setTipoMensaje("exito");

                // Limpia el formulario
                setNombre('');
                setCorreo('');
                setContraseña('');

                // Auto-login: guardar sesión y navegar a Perfiles
                if (resultado.data?.usuario) {
                    try {
                        await establecerUsuario(resultado.data.usuario);
                        navigation.navigate('Perfiles', { idUsuario: resultado.data.usuario.id });
                    } catch (e) {
                        navigation.navigate('Login');
                    }
                } else {
                    navigation.navigate('Login');
                }

            } else {
                setMensaje(resultado.mensaje);
                setTipoMensaje("error");
            }

        } catch (error) {
            console.error('❌ Error en registro:', error);
            setMensaje("Ocurrió un error inesperado. Inténtalo de nuevo.");
            setTipoMensaje("error");
        } finally {
            setCargando(false);
        }
    };

    return (
        <SafeAreaView style={estilos.safeArea} edges={['top']}>
            <LinearGradient
                colors={['#a7c7c928', '#1a1a1a', '#000000']}
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
                        <Ionicons name="arrow-back" size={24} color="#080808ff" />
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
                                <Text style={estilos.titulo}>CREA TU CUENTA</Text>

                                <TextInput
                                    style={estilos.input}
                                    placeholder="Nombre completo"
                                    placeholderTextColor="#aaa"
                                    value={nombre}
                                    onChangeText={setNombre}
                                    autoCapitalize="words"
                                />

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

                                <View style={estilos.inputWrapper}>
                                    <TextInput
                                        style={[estilos.input, estilos.inputConIcono]}
                                        placeholder="Contraseña"
                                        placeholderTextColor="#aaa"
                                        secureTextEntry={!mostrarContrasena}
                                        value={contraseña}
                                        onChangeText={setContraseña}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity
                                        accessibilityRole="button"
                                        accessibilityLabel={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                        style={estilos.toggleIcon}
                                        onPress={() => setMostrarContrasena(prev => !prev)}
                                    >
                                        <Ionicons name={mostrarContrasena ? 'eye-off' : 'eye'} size={22} color="#bbb" />
                                    </TouchableOpacity>
                                </View>
                                {/* Mensaje dinámico */}
                                {mensaje !== "" && (
                                    <Text style={[estilos.mensaje, tipoMensaje === "error" ? estilos.error : estilos.exito]}>
                                        {mensaje}
                                    </Text>
                                )}

                                <TouchableOpacity
                                    style={[estilos.boton, cargando && estilos.botonDeshabilitado]}
                                    onPress={manejarRegistro}
                                    disabled={cargando}
                                >
                                    <Text style={estilos.textoBoton}>
                                        {cargando ? 'Registrando...' : 'Registrarme'}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => navigation.navigate("Login")} style={estilos.btnIniciaSesion}>
                                    <Text style={estilos.textoAlternativo}>
                                        ¿Ya tienes una cuenta?
                                    </Text>
                                    <Text style={estilos.texto2}>Inicia sesión</Text>
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
        flex: 1,
        backgroundColor: '#d34c4c2a',
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
        position: "relative"
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
    inputWrapper: {
        width: '100%',
        marginBottom: 15,
        position: 'relative',
    },
    inputConIcono: {
        paddingRight: 44,
        marginBottom: 0,
    },
    toggleIcon: {
        position: 'absolute',
        right: 12,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mensaje: {
        textAlign: "center",
        marginBottom: 10,
        fontSize: 15,
        fontWeight: "600"
    },
    error: {
        color: "#ff5555"
    },
    exito: {
        color: "#33ff88"
    },
    boton: {
        backgroundColor: "#E50914",
        padding: 12,
        borderRadius: 6,
        width: "80%",
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
    btnIniciaSesion: {
        flexDirection: 'row'
    },
    textoAlternativo: {
        color: "#cccccc",
        marginTop: 25,
        fontSize: 15
    },
    texto2: {
        color: '#cccccc',
        marginTop: 25,
        textDecorationLine: 'underline',
        marginLeft: 5,
        fontSize: 15,
    }
});