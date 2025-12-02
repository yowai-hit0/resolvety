// Icon component wrapper for Font Awesome
// Usage: <Icon icon={faHome} /> or <Icon icon={faHome} className="text-accent" />

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface IconProps {
  icon: IconDefinition;
  className?: string;
  size?: 'xs' | 'sm' | 'lg' | 'xl' | '2x' | '3x' | '4x' | '5x' | '6x' | '7x' | '8x' | '9x' | '10x';
  spin?: boolean;
  pulse?: boolean;
  flip?: 'horizontal' | 'vertical' | 'both';
  rotation?: 90 | 180 | 270;
}

export default function Icon({ 
  icon, 
  className = '', 
  size,
  spin = false,
  pulse = false,
  flip,
  rotation
}: IconProps) {
  return (
    <FontAwesomeIcon 
      icon={icon} 
      className={className}
      size={size}
      spin={spin}
      pulse={pulse}
      flip={flip}
      rotation={rotation}
    />
  );
}

// Export commonly used icons for convenience
export { 
  faHome,
  faUser,
  faEnvelope,
  faPhone,
  faSearch,
  faBars,
  faTimes,
  faChevronDown,
  faChevronUp,
  faChevronLeft,
  faChevronRight,
  faArrowRight,
  faArrowLeft,
  faCheck,
  faTimes as faX,
  faRotateRight as faRefresh,
  faEdit,
  faTrash,
  faPlus,
  faMinus,
  faDownload,
  faUpload,
  faFile,
  faFolder,
  faImage,
  faBook,
  faBookmark,
  faCalendar,
  faClock,
  faBell,
  faCog,
  faRightFromBracket,
  faRightToBracket,
  faLocationDot,
  faUsers,
  faCheckCircle,
  faFileAlt,
  faDollarSign,
  faNewspaper,
  faAward,
  faBuilding,
  faSpinner,
  faCircleXmark,
  faDatabase,
  faStar,
  faLock,
  faUserShield,
  faFilter,
  faExclamationCircle,
  faEye,
  faReceipt,
  faCreditCard,
  faIdCard,
  faCamera,
  faSave,
  faShield,
  faEyeSlash,
  faFlag,
  faCircle,
  faQuestionCircle,
  faChartLine,
  faChartBar,
  faChartPie,
  faChartArea,
  faTable,
  faList,
  faTh,
  faStore,
  faHome as faHomeIcon,
  faShoppingCart,
  faBox,
  faTag,
  faMoneyBillWave,
  faWallet,
  faHandshake,
  faClipboardList,
  faTasks,
  faUserCheck,
  faUserTimes,
  faUserPlus,
  faChartLine as faTrendingUp,
  faArrowTrendUp,
  faArrowTrendDown,
  faBed,
  faBath,
  faRuler,
  faPalette,
  faFileInvoice,
  faQrcode,
  faThumbsUp,
  faTimesCircle,
  faBarcode,
  faGlobe,
  faTicketAlt,
  faComments,
  faPaperPlane,
  faHistory,
  faUserTag,
  faArrowUp,
  faArrowDown,
  faArrowsUpDown,
  faRotateRight,
} from '@fortawesome/free-solid-svg-icons';

// Import for legacy exports
import { faRightFromBracket, faRightToBracket, faLocationDot as faLocationDotIcon } from '@fortawesome/free-solid-svg-icons';

// Alias for location icon
export const faMapMarkerAlt = faLocationDotIcon;

// Legacy exports for backwards compatibility
export const faSignOutAlt = faRightFromBracket;
export const faSignInAlt = faRightToBracket;

export {
  faUser as faUserRegular,
  faEnvelope as faEnvelopeRegular,
  faCalendar as faCalendarRegular,
  faFile as faFileRegular,
} from '@fortawesome/free-regular-svg-icons';

export {
  faFacebook,
  faTwitter,
  faInstagram,
  faLinkedin,
  faYoutube,
  faGithub,
} from '@fortawesome/free-brands-svg-icons';

