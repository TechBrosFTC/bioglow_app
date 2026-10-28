import {defineConfig} from 'vite'; import vue from '@vitejs/plugin-vue'; import {VitePWA} from 'vite-plugin-pwa';
export default defineConfig({plugins:[vue(),VitePWA({registerType:'autoUpdate',manifest:{name:'BPS – Bee Protection System',short_name:'BPS',theme_color:'#123d2d',background_color:'#f6f7f2',display:'standalone',icons:[]}})],server:{port:5173}})
