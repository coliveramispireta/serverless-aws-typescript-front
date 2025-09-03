import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Container,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const FAQAccordion = () => {
  const faqs = [
    {
      category: "Sobre el Backend",
      items: [
        {
          question: "¿Qué tecnologías se usan en el backend?",
          answer:
            "El backend está construido de forma serverless usando AWS Lambda para la lógica de negocio, API Gateway como capa de exposición de endpoints y DynamoDB como base de datos NoSQL para el almacenamiento de los tickets. Además, se utilizan funciones Lambda con permisos granulares otorgados por IAM y monitoreo a través de CloudWatch para asegurar confiabilidad y trazabilidad.",
        },
        {
          question: "¿El proyecto utiliza AWS puro?",
          answer:
            "Sí, el backend está 100% implementado con servicios nativos de AWS, sin necesidad de servidores propios ni frameworks externos pesados. Esto permite escalabilidad automática, alta disponibilidad y costos optimizados bajo demanda, aprovechando la infraestructura administrada por AWS.",
        },
        {
          question: "¿Cómo se gestionan los permisos y la seguridad?",
          answer:
            "Cada Lambda tiene roles IAM específicos que limitan el acceso solo a los recursos necesarios. Además, API Gateway se protege con autenticación vía Cognito para garantizar que únicamente usuarios autorizados puedan invocar los endpoints.",
        },
        {
          question: "¿Cómo se asegura la observabilidad del backend?",
          answer:
            "El sistema utiliza Amazon CloudWatch para centralizar logs, métricas y alarmas. Esto permite detectar errores, medir rendimiento y escalar recursos según la carga de manera automática.",
        },
        {
          question: "¿El backend es fácilmente escalable?",
          answer:
            "Sí, gracias a su arquitectura serverless, Lambda escala automáticamente en función del número de solicitudes. DynamoDB también ajusta su capacidad bajo demanda, asegurando que el sistema pueda crecer sin necesidad de configuración manual.",
        },
      ],
    },
    {
      category: "Sobre Cognito",
      items: [
        {
          question: "¿Qué rol cumple Cognito en el sistema?",
          answer:
            "Amazon Cognito se encarga de la autenticación y autorización de usuarios. Permite gestionar inicios de sesión seguros, integración con Google, y asegura que solo usuarios autorizados puedan crear, editar o eliminar tickets.",
        },
        {
          question: "¿Por qué no se envía un correo de confirmación al registrarse?",
          answer:
            "En este sistema configuré una Lambda PreSignUp que intercepta el flujo de registro y confirma automáticamente al usuario. Esto evita que Cognito envíe un correo de confirmación, simplificando la experiencia de registro.",
        },
        {
          question: "¿Qué hace exactamente la Lambda PreSignUp?",
          answer:
            "La Lambda PreSignUp se ejecuta justo después del registro y antes de que Cognito confirme la cuenta. En nuestro caso, marca al usuario como confirmado (autoConfirmUser = true).",
        },
        {
          question: "¿Se puede personalizar el flujo de registro con Cognito?",
          answer:
            "Sí. Cognito permite triggers en distintas etapas: PreSignUp, PostConfirmation, PreAuthentication, entre otros. Con estos se puede validar dominios de correo, asignar roles, o ejecutar lógica de negocio antes de completar el registro.",
        },
        {
          question: "¿Cómo funciona la recuperación de contraseña?",
          answer:
            "El usuario solicita 'Olvidé mi contraseña', Cognito envía un código de verificación al correo y el usuario lo usa junto con su nueva contraseña. Esto se maneja con las funciones resetPassword y confirmResetPassword de Amplify.",
        },
      ],
    },
    {
      category: "Sobre Amplify",
      items: [
        {
          question: "¿Qué ventajas tiene usar Amplify junto con Cognito?",
          answer:
            "Amplify provee métodos listos para usar como signUp, signIn, signOut, resetPassword y confirmResetPassword. Simplifica la integración con Cognito y maneja automáticamente los tokens de sesión en el frontend.",
        },
        {
          question: "¿Amplify maneja los tokens de autenticación?",
          answer:
            "Sí. Amplify gestiona automáticamente los tokens de acceso (Access Token, ID Token y Refresh Token). El desarrollador puede acceder a ellos con fetchAuthSession sin preocuparse por su almacenamiento seguro.",
        },
      ],
    },
    {
      category: "Sobre el Frontend",
      items: [
        {
          question: "¿Con qué tecnologías está desarrollado el frontend?",
          answer:
            "El frontend está desarrollado en React con TypeScript, usando Material UI como librería de componentes para una experiencia moderna y consistente. Además, se conecta al backend a través de las APIs expuestas en AWS API Gateway.",
        },
        {
          question: "¿El frontend también es serverless?",
          answer:
            "Sí, el frontend se despliega en un hosting estático serverless como AWS S3 + CloudFront, lo que garantiza baja latencia, alta disponibilidad y una distribución global eficiente.",
        },
      ],
    },
    {
      category: "Sobre el CRUD de Tickets",
      items: [
        {
          question: "¿Qué funcionalidades incluye el CRUD de gestión de tickets?",
          answer:
            "Permite crear nuevos tickets, ver el listado completo, editar información existente y eliminar tickets. Todo se gestiona en tiempo real con DynamoDB como base de datos central.",
        },
        {
          question: "¿Cómo se asegura la integridad de los datos?",
          answer:
            "Cada operación pasa por validaciones en AWS Lambda antes de guardarse en DynamoDB. Además, la autenticación de Cognito restringe acciones según el rol del usuario, garantizando que solo usuarios autorizados modifiquen la información.",
        },
        {
          question: "¿Qué pasa si necesito escalar el sistema?",
          answer:
            "Al ser un proyecto serverless, el escalado es automático. Si el número de usuarios o transacciones aumenta, AWS Lambda y DynamoDB ajustan la capacidad de forma transparente sin intervención manual.",
        },
      ],
    },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>
        Preguntas Frecuentes
      </Typography>

      {faqs.map((section, sectionIndex) => (
        <Box key={sectionIndex} mt={4}>
          <Typography variant="h6" gutterBottom color="primary">
            {section.category}
          </Typography>
          {section.items.map((item, index) => (
            <Accordion key={index}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{item.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary">{item.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      ))}
    </Container>
  );
};

export default FAQAccordion;
