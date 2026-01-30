// --- Icon Configuration ---
// Primary Icon Pack: @phosphor-icons/react
// Fallback Icon Pack: lucide-react

// 1. Import everything from Phosphor (Generic Import)
import * as PhosphorIcons from '@phosphor-icons/react';

// 2. Import everything from Lucide as Fallback
import * as LucideIcons from 'lucide-react';

// Debug Log
console.log("Phosphor Icons Loaded v2:", Object.keys(PhosphorIcons).length);

// --- MAPPING LAYER ---
// We try to find the icon in Phosphor first. If not found, use Lucide.
// Note: Phosphor icons usually don't have "Icon" suffix in this package, generally matching Lucide names.
// Some manual remapping is needed for known differences.

const getIcon = (name, phosphorName = null) => {
    // Try explicit phosphor name if provided, else try matching name
    const pName = phosphorName || name;
    if (PhosphorIcons[pName]) return PhosphorIcons[pName];

    // Fallback to Lucide
    console.warn(`Icon fallback triggered for: ${name} (tried ${pName})`);
    if (LucideIcons[name]) return LucideIcons[name];

    // Final fallback (shouldn't happen if Lucide has it)
    return LucideIcons.HelpCircle;
};

export const Activity = getIcon('Activity');
export const AlertCircle = getIcon('AlertCircle', 'WarningCircle');
export const AlertOctagon = getIcon('AlertOctagon', 'WarningOctagon');
export const AlertTriangle = getIcon('AlertTriangle', 'Warning');
export const ArrowLeft = getIcon('ArrowLeft');
export const ArrowRight = getIcon('ArrowRight');
export const ArrowUpRight = getIcon('ArrowUpRight');
export const Award = getIcon('Award', 'Medal');
export const BadgeCheck = getIcon('BadgeCheck', 'SealCheck');
export const BarChart2 = getIcon('BarChart2', 'ChartBar');
export const BarChart3 = getIcon('BarChart3', 'ChartBar'); // Phosphor doesn't have 2 vs 3 distinct
export const Bell = getIcon('Bell');
export const BellRing = getIcon('BellRing', 'BellRinging');
export const Bookmark = getIcon('Bookmark');
export const Bot = getIcon('Bot', 'Robot');
export const Brain = getIcon('Brain');
export const BrainCircuit = getIcon('BrainCircuit', 'Brain'); // Approximate
export const Briefcase = getIcon('Briefcase');
export const Calendar = getIcon('Calendar');
export const CalendarClock = getIcon('CalendarClock', 'CalendarBlank'); // Approximate
export const Camera = getIcon('Camera');
export const Check = getIcon('Check');
export const CheckCircle = getIcon('CheckCircle');
export const CheckCircle2 = getIcon('CheckCircle2', 'CheckCircle');
export const ChevronDown = getIcon('ChevronDown', 'CaretDown');
export const ChevronLeft = getIcon('ChevronLeft', 'CaretLeft');
export const ChevronRight = getIcon('ChevronRight', 'CaretRight');
export const ChevronUp = getIcon('ChevronUp', 'CaretUp');
export const Cigarette = getIcon('Cigarette');
export const Clipboard = getIcon('Clipboard');
export const ClipboardCheck = getIcon('ClipboardCheck', 'ClipboardText');
export const ClipboardList = getIcon('ClipboardList', 'ClipboardText');
export const Clock = getIcon('Clock');
export const CloudFog = getIcon('CloudFog');
export const Copy = getIcon('Copy');
export const Cpu = getIcon('Cpu');
export const CreditCard = getIcon('CreditCard');
export const Crown = getIcon('Crown');
export const Database = getIcon('Database');
export const Dna = getIcon('Dna');
export const Download = getIcon('Download');
export const Droplet = getIcon('Droplet', 'Drop');
export const Droplets = getIcon('Droplets', 'Drop');
export const Edit = getIcon('Edit', 'PencilSimple');
export const Edit2 = getIcon('Edit2', 'PencilSimple');
export const ExternalLink = getIcon('ExternalLink', 'ArrowSquareOut');
export const Eye = getIcon('Eye');
export const Facebook = getIcon('Facebook', 'FacebookLogo');
export const File = getIcon('File');
export const FileCheck = getIcon('FileCheck');
export const FilePlus = getIcon('FilePlus');
export const FileSpreadsheet = getIcon('FileSpreadsheet', 'MicrosoftExcelLogo'); // Specific but close
export const FileText = getIcon('FileText');
export const Filter = getIcon('Filter');
export const Flag = getIcon('Flag');
export const FlaskConical = getIcon('FlaskConical', 'Flask');
export const Globe = getIcon('Globe');
export const Hash = getIcon('Hash');
export const Heart = getIcon('Heart');
export const HeartPulse = getIcon('HeartPulse', 'Heartbeat');
export const HelpCircle = getIcon('HelpCircle', 'Question');
export const History = getIcon('History', 'ClockCounterClockwise');
export const Home = getIcon('Home');
export const Hospital = getIcon('Hospital', 'Buildings'); // Approx
export const Hourglass = getIcon('Hourglass');
export const Image = getIcon('Image');
export const Info = getIcon('Info');
export const Instagram = getIcon('Instagram', 'InstagramLogo');
export const Key = getIcon('Key');
export const Laptop = getIcon('Laptop');
export const Layers = getIcon('Layers', 'Stack');
export const LayoutDashboard = getIcon('LayoutDashboard', 'SquaresFour');
export const Lightbulb = getIcon('Lightbulb');
export const Link = getIcon('Link');
export const Linkedin = getIcon('Linkedin', 'LinkedinLogo');
export const Loader = getIcon('Loader', 'Spinner');
export const Loader2 = getIcon('Loader2', 'SpinnerGap');
export const Lock = getIcon('Lock');
export const LogIn = getIcon('LogIn', 'SignIn');
export const LogOut = getIcon('LogOut', 'SignOut');
export const Mail = getIcon('Mail', 'Envelope');
export const Map = getIcon('Map', 'MapTrifold');
export const MapPin = getIcon('MapPin');
export const Menu = getIcon('Menu', 'ListDashes');
export const MessageSquare = getIcon('MessageSquare', 'Chat');
export const Mic = getIcon('Mic', 'Microphone');
export const MicOff = getIcon('MicOff', 'MicrophoneSlash');
export const Microscope = getIcon('Microscope', 'MagnifyingGlass'); // Phosphor might not have exact microscope? Checking fallback.
export const Monitor = getIcon('Monitor');
export const MoreHorizontal = getIcon('MoreHorizontal', 'DotsThree');
export const MoreVertical = getIcon('MoreVertical', 'DotsThreeVertical');
export const Paperclip = getIcon('Paperclip');
export const Phone = getIcon('Phone');
export const PhoneIncoming = getIcon('PhoneIncoming', 'PhoneCall');
export const PhoneOff = getIcon('PhoneOff', 'PhoneSlash');
export const Pill = getIcon('Pill');
export const Plus = getIcon('Plus');
export const Printer = getIcon('Printer');
export const Play = getIcon('Play');
export const Pause = getIcon('Pause');
export const Maximize = getIcon('Maximize', 'CornersOut');
export const QrCode = getIcon('QrCode');
export const RefreshCcw = getIcon('RefreshCcw', 'ArrowsCounterClockwise');
export const RefreshCw = getIcon('RefreshCw', 'ArrowsClockwise');
export const Save = getIcon('Save', 'FloppyDisk');
export const ScanEye = getIcon('ScanEye', 'Scan');
export const ScrollText = getIcon('ScrollText', 'Scroll');
export const Search = getIcon('Search', 'MagnifyingGlass');
export const Send = getIcon('Send', 'PaperPlaneRight');
export const Server = getIcon('Server', 'HardDrives');
export const ServerCrash = getIcon('ServerCrash', 'HardDrives'); // fallback
export const Settings = getIcon('Settings', 'Gear');
export const Share2 = getIcon('Share2', 'ShareNetwork');
export const Shield = getIcon('Shield');
export const ShieldAlert = getIcon('ShieldAlert', 'ShieldWarning');
export const ShieldCheck = getIcon('ShieldCheck');
export const ShieldPlus = getIcon('ShieldPlus');
export const Signal = getIcon('Signal');
export const Siren = getIcon('Siren');
export const Skull = getIcon('Skull');
export const Smartphone = getIcon('Smartphone', 'DeviceMobile');
export const Sparkles = getIcon('Sparkles');
export const Star = getIcon('Star');
export const Stethoscope = getIcon('Stethoscope'); // Phosphor has this?
export const Thermometer = getIcon('Thermometer');
export const Timer = getIcon('Timer');
export const ToggleLeft = getIcon('ToggleLeft');
export const ToggleRight = getIcon('ToggleRight');
export const Trash2 = getIcon('Trash2', 'Trash');
export const TrendingUp = getIcon('TrendingUp', 'TrendUp');
export const Twitter = getIcon('Twitter', 'TwitterLogo');
export const Unlock = getIcon('Unlock', 'LockOpen');
export const Upload = getIcon('Upload');
export const UploadCloud = getIcon('UploadCloud', 'CloudArrowUp');
export const User = getIcon('User');
export const UserCog = getIcon('UserCog', 'UserGear');
export const UserPlus = getIcon('UserPlus');
export const Users = getIcon('Users');
export const Utensils = getIcon('Utensils', 'ForkKnife');
export const Video = getIcon('Video', 'VideoCamera');
export const VideoOff = getIcon('VideoOff', 'VideoCameraSlash');
export const Volume2 = getIcon('Volume2', 'SpeakerHigh');
export const VolumeX = getIcon('VolumeX', 'SpeakerX');
export const Wifi = getIcon('Wifi');
export const Wind = getIcon('Wind');
export const X = getIcon('X');
export const XCircle = getIcon('XCircle', 'XCircle');
export const Youtube = getIcon('Youtube', 'YoutubeLogo');
export const Zap = getIcon('Zap', 'Lightning');
