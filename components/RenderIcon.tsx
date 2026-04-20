import React from 'react';
import {
  AlertCircle, Activity, Anchor, Aperture, Archive, ArrowRight, ArrowUp, ArrowDown, ArrowLeft,
  Award, Battery, Bell, Book, Bookmark, Box, Briefcase, Calendar, Camera, Check,
  CheckCircle, ChevronRight, ChevronDown, Circle, Clipboard, Clock, Cloud, Code,
  Coffee, Command, Compass, Copy, Cpu, CreditCard, Crop, Crosshair, Database, 
  Download, Edit, ExternalLink, Eye, EyeOff, FastForward, FileText, Filter, Flag,
  Folder, Gift, Globe, Hash, Heart, Home, Image as ImageIcon, Inbox, Info, Key, Layers,
  Layout, LayoutTemplate, Link, List, Lock, Mail, Map, MapPin, Maximize, MessageCircle, MessageSquare,
  Mic, Minimize, Monitor, Moon, MoreHorizontal, MoreVertical, MousePointer, Music, 
  Navigation, Package, Paperclip, Pause, PenTool, Percent, Phone, PieChart, Play, 
  Plus, PlusCircle, Power, Printer, Radio, RefreshCw, Repeat, Save, Scissors, Search,
  Send, Settings, Share2, Shield, ShoppingBag, ShoppingCart, Shuffle, SkipBack, SkipForward,
  Slack, Smartphone, Smile, Sparkles, Speaker, Square, Star, StopCircle, Sun, Sunrise,
  Sunset, Tablet, Tag, Target, Terminal, ThumbsDown, ThumbsUp, ToggleLeft, ToggleRight,
  Trash, Trash2, TrendingDown, TrendingUp, Triangle, Truck, Tv, Twitter, 
  Type, Umbrella, Unlock, Upload, UploadCloud, User, UserCheck, UserMinus, UserPlus, 
  Users, Video, Volume, Volume1, Volume2, VolumeX, Watch, Wifi, WifiOff, Wind, 
  Zap, ZoomIn, ZoomOut,
  
  AlignCenter, AlignJustify, AlignLeft, AlignRight, Apple, AtSign, BarChart, BarChart2, Bold, 
  Chrome, CloudLightning, CloudRain, CloudSnow, Codesandbox, Columns, Delete, Disc, Droplet, 
  Edit2, Edit3, Figma, File, Framer, Github, Gitlab, HardDrive, Headphones, Hexagon, 
  Instagram, Italic, LifeBuoy, Linkedin, Maximize2, Minimize2, Navigation2, Octagon, 
  PlayCircle, Pocket, RefreshCcw, Rewind, Rss, Server, ShieldOff, Sidebar, Sliders, 
  Thermometer, Trello, Underline, VideoOff, Webhook, Youtube, ShieldAlert, ShieldCheck,
  Wand2, Sword, Skull, Ghost, Crown, Flame, ZapOff, Fingerprint, Bug, Telescope,
  Rocket, Plane, Car, Bus, Train, Ship, Bike, Gamepad, Gamepad2, Joystick, Dices,
  Puzzle, Paintbrush, Palette, Lightbulb, LightbulbOff, FlaskConical, Beaker, Sprout,
  Leaf, Flower, Trees, Droplets, Snowflake, Mountain, Tent, 
  MapPinOff, Ticket, Popcorn, Glasses, Hand, HandMetal, HelpingHand,
  BriefcaseMedical, Stethoscope, Syringe, Pill, Building, Building2, 
  Store, Factory, Castle, Banknote, Coins, Wallet, Receipt
} from 'lucide-react';

export const POPULAR_ICONS: Record<string, React.ElementType> = {
  AlertCircle, Activity, Anchor, Aperture, Archive, ArrowRight, ArrowUp, ArrowDown, ArrowLeft,
  Award, Battery, Bell, Book, Bookmark, Box, Briefcase, Calendar, Camera, Check,
  CheckCircle, ChevronRight, ChevronDown, Circle, Clipboard, Clock, Cloud, Code,
  Coffee, Command, Compass, Copy, Cpu, CreditCard, Crop, Crosshair, Database, 
  Download, Edit, ExternalLink, Eye, EyeOff, FastForward, FileText, Filter, Flag,
  Folder, Gift, Globe, Hash, Heart, Home, ImageIcon, Inbox, Info, Key, Layers,
  Layout, LayoutTemplate, Link, List, Lock, Mail, Map, MapPin, Maximize, MessageCircle, MessageSquare,
  Mic, Minimize, Monitor, Moon, MoreHorizontal, MoreVertical, MousePointer, Music, 
  Navigation, Package, Paperclip, Pause, PenTool, Percent, Phone, PieChart, Play, 
  Plus, PlusCircle, Power, Printer, Radio, RefreshCw, Repeat, Save, Scissors, Search,
  Send, Settings, Share2, Shield, ShoppingBag, ShoppingCart, Shuffle, SkipBack, SkipForward,
  Slack, Smartphone, Smile, Sparkles, Speaker, Square, Star, StopCircle, Sun, Sunrise,
  Sunset, Tablet, Tag, Target, Terminal, ThumbsDown, ThumbsUp, ToggleLeft, ToggleRight,
  Trash, Trash2, TrendingDown, TrendingUp, Triangle, Truck, Tv, Twitter, 
  Type, Umbrella, Unlock, Upload, UploadCloud, User, UserCheck, UserMinus, UserPlus, 
  Users, Video, Volume, Volume1, Volume2, VolumeX, Watch, Wifi, WifiOff, Wind, 
  Zap, ZoomIn, ZoomOut,
  
  AlignCenter, AlignJustify, AlignLeft, AlignRight, Apple, AtSign, BarChart, BarChart2, Bold, 
  Chrome, CloudLightning, CloudRain, CloudSnow, Codesandbox, Columns, Delete, Disc, Droplet, 
  Edit2, Edit3, Figma, File, Framer, Github, Gitlab, HardDrive, Headphones, Hexagon, 
  Instagram, Italic, LifeBuoy, Linkedin, Maximize2, Minimize2, Navigation2, Octagon, 
  PlayCircle, Pocket, RefreshCcw, Rewind, Rss, Server, ShieldOff, Sidebar, Sliders, 
  Thermometer, Trello, Underline, VideoOff, Webhook, Youtube, ShieldAlert, ShieldCheck,
  Wand2, Sword, Skull, Ghost, Crown, Flame, ZapOff, Fingerprint, Bug, Telescope,
  Rocket, Plane, Car, Bus, Train, Ship, Bike, Gamepad, Gamepad2, Joystick, Dices,
  Puzzle, Paintbrush, Palette, Lightbulb, LightbulbOff, FlaskConical, Beaker, Sprout,
  Leaf, Flower, Trees, Droplets, Snowflake, Mountain, Tent, 
  MapPinOff, Ticket, Popcorn, Glasses, Hand, HandMetal, HelpingHand,
  BriefcaseMedical, Stethoscope, Syringe, Pill, Building, Building2, 
  Store, Factory, Castle, Banknote, Coins, Wallet, Receipt
};

export function RenderIcon({ icon, className = "", ...props }: { icon?: string | null, className?: string, [key: string]: any }) {
  if (!icon) return null;
  
  let renderName = icon;
  let color = undefined;

  if (icon.includes('|')) {
    const parts = icon.split('|');
    renderName = parts[0];
    color = parts[1];
  }

  if (renderName.startsWith('lucide:')) {
    const name = renderName.slice(7);
    const Icon = POPULAR_ICONS[name];
    if (Icon) {
      return <Icon className={className} color={color || "currentColor"} {...props} />;
    }
  }
  
  return <span className={`flex items-center justify-center ${className}`} {...props}>{renderName}</span>;
}
