import {} from 'react'
import './scss/input.scss'
import {BrowserRouter} from "react-router-dom";
import { createTheme, ThemeProvider } from '@mui/material';
import { frFR } from '@mui/material/locale';

import Nav from './components/Nav/Nav';
import Footer from './components/Footer/Footer';
import GlobalInfo from './components/GlobalInfo';
import AnimatedRoutes from './components/AnimatedRoutes';

// Modification de Material UI -----------------
const muiTheme = createTheme({
  palette: {
    primary: { main: '#95FDFC'},
    secondary: { main: '#FEBEFD' },
    mode: 'dark',
  },
},
frFR, // Changement de langue en francais des textes MUI
);

function App() {

  return (
    // Thème modifié pour Matérial UI
    <ThemeProvider theme={muiTheme}>
      <BrowserRouter>
          <GlobalInfo>
            <Nav/>
            <AnimatedRoutes/>
            <Footer/>
          </GlobalInfo>

      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
