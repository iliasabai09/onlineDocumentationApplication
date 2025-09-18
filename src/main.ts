import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Checkbox from 'primevue/checkbox'
import Divider from 'primevue/divider'
import InputSwitch from 'primevue/inputswitch'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import './style.css'

const app = createApp(App)

app.use(PrimeVue, {
  ripple: true,
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: 'html.dark',
    },
  },
})

app.component('Button', Button)
app.component('Card', Card)
app.component('Checkbox', Checkbox)
app.component('Divider', Divider)
app.component('InputSwitch', InputSwitch)
app.component('InputText', InputText)
app.component('Password', Password)

app.mount('#app')
