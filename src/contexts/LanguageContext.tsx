
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define supported languages
export type Language = 'en' | 'es' | 'fr';

// Define translations interface
interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

// Create translations object with all app strings
export const translations: Translations = {
  // Header and navigation
  'nav.home': {
    en: 'Home',
    es: 'Inicio',
    fr: 'Accueil'
  },
  'nav.roomService': {
    en: 'Room Service',
    es: 'Servicio de habitación',
    fr: 'Service de chambre'
  },
  'nav.spa': {
    en: 'Spa',
    es: 'Spa',
    fr: 'Spa'
  },
  'nav.activities': {
    en: 'Activities',
    es: 'Actividades',
    fr: 'Activités'
  },
  'nav.wallet': {
    en: 'Wallet',
    es: 'Billetera',
    fr: 'Portefeuille'
  },
  'nav.chat': {
    en: 'Chat with Reception',
    es: 'Chatear con Recepción',
    fr: 'Chat avec la Réception'
  },
  
  // Home page
  'home.welcomeTitle': {
    en: 'Welcome to Your Stay',
    es: 'Bienvenido a su estancia',
    fr: 'Bienvenue pour votre séjour'
  },
  'home.welcomeText': {
    en: 'Experience premium services and amenities',
    es: 'Experimente servicios y comodidades premium',
    fr: 'Découvrez des services et équipements premium'
  },
  'home.roomInfo': {
    en: 'Room Information',
    es: 'Información de la habitación',
    fr: 'Informations sur la chambre'
  },
  'home.room': {
    en: 'Room',
    es: 'Habitación',
    fr: 'Chambre'
  },
  'home.checkout': {
    en: 'Checkout',
    es: 'Salida',
    fr: 'Départ'
  },
  'home.todayActivities': {
    en: "Today's Activities",
    es: 'Actividades de hoy',
    fr: "Activités d'aujourd'hui"
  },
  'home.viewAll': {
    en: 'View All',
    es: 'Ver todo',
    fr: 'Voir tout'
  },
  'home.noReservations': {
    en: 'No Current Reservations',
    es: 'Sin reservas actuales',
    fr: 'Aucune réservation en cours'
  },
  'home.noReservationsDesc': {
    en: "You don't have any active room service orders, spa appointments, or activity bookings.",
    es: 'No tiene ningún pedido de servicio a la habitación, citas de spa o reservas de actividades activas.',
    fr: "Vous n'avez aucune commande de service d'étage, rendez-vous spa ou réservation d'activité en cours."
  },
  'home.orderService': {
    en: 'Order Room Service',
    es: 'Pedir servicio a la habitación',
    fr: 'Commander un service de chambre'
  },
  'home.bookSpa': {
    en: 'Book Spa Treatment',
    es: 'Reservar tratamiento de spa',
    fr: 'Réserver un soin spa'
  },
  'home.viewActivities': {
    en: 'View Activities',
    es: 'Ver actividades',
    fr: 'Voir les activités'
  },
  
  // Room service
  'roomService.title': {
    en: 'Room Service',
    es: 'Servicio de habitación',
    fr: 'Service de chambre'
  },
  'roomService.subtitle': {
    en: 'Order delicious meals and refreshments directly to your room',
    es: 'Pida deliciosas comidas y refrescos directamente a su habitación',
    fr: 'Commandez de délicieux repas et rafraîchissements directement dans votre chambre'
  },
  
  // Buttons and actions
  'button.add': {
    en: 'Add',
    es: 'Añadir',
    fr: 'Ajouter'
  },
  'button.view': {
    en: 'View Details',
    es: 'Ver detalles',
    fr: 'Voir les détails'
  },
  'button.cancel': {
    en: 'Cancel',
    es: 'Cancelar',
    fr: 'Annuler'
  },
  'button.book': {
    en: 'Book Now',
    es: 'Reservar ahora',
    fr: 'Réserver maintenant'
  },
  
  // Status labels
  'status.booked': {
    en: 'Booked',
    es: 'Reservado',
    fr: 'Réservé'
  },
  'status.ongoing': {
    en: 'Ongoing',
    es: 'En curso',
    fr: 'En cours'
  },
  'status.upcoming': {
    en: 'Upcoming',
    es: 'Próximo',
    fr: 'À venir'
  },
  
  // Chat page
  'chat.title': {
    en: 'Chat with Reception',
    es: 'Chatear con Recepción',
    fr: 'Chat avec la Réception'
  },
  'chat.subtitle': {
    en: 'Need assistance? Message our reception team directly.',
    es: '¿Necesita ayuda? Envíe un mensaje directamente a nuestro equipo de recepción.',
    fr: 'Besoin d\'aide ? Envoyez un message directement à notre équipe de réception.'
  },
  'chat.placeholder': {
    en: 'Type your message...',
    es: 'Escriba su mensaje...',
    fr: 'Écrivez votre message...'
  },
  'chat.welcome': {
    en: 'Welcome to Hotel Service! How can I help you today?',
    es: '¡Bienvenido al Servicio del Hotel! ¿Cómo puedo ayudarle hoy?',
    fr: 'Bienvenue au Service de l\'Hôtel ! Comment puis-je vous aider aujourd\'hui ?'
  },
  'chat.received': {
    en: 'Thank you for your message. A member of our reception team will respond shortly.',
    es: 'Gracias por su mensaje. Un miembro de nuestro equipo de recepción responderá en breve.',
    fr: 'Merci pour votre message. Un membre de notre équipe de réception vous répondra sous peu.'
  },
  'chat.notification': {
    en: 'Message received',
    es: 'Mensaje recibido',
    fr: 'Message reçu'
  },
  'chat.notificationDesc': {
    en: 'The reception team has been notified.',
    es: 'El equipo de recepción ha sido notificado.',
    fr: 'L\'équipe de réception a été notifiée.'
  }
};

// Create the context
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider component
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Try to get saved language from localStorage, or default to English
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    return (savedLanguage as Language) || 'en';
  });

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translations[key][language] || translations[key]['en'] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook for using the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
