import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import Cookies from 'js-cookie';
import { themes } from './Components/Common/Theme';

import allReducer from './Reducer/reducerCombiner';
import { createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { Provider } from 'react-redux';
import { Box, CssBaseline, ScopedCssBaseline, Toolbar } from '@mui/material';
import { BrowserRouter as Router } from 'react-router-dom';
import TopBar from './Components/Common/TopBar/TopBar';
import Routing from './Components/Routing/Routing';
import LoginChecker from './Components/Common/LoginChecker/LoginChecker';

function App() {
  const [themeCookie, setthemeCookie] = useState(0)
  const store = createStore(allReducer, composeWithDevTools())

  useEffect(() => {
    setthemeCookie(Cookies.get("theme") !== undefined ? Number(Cookies.get("theme")) : 3)
  }, [])

  return (
    <ThemeProvider theme={themes[themeCookie]}>
      <Router>

        <ScopedCssBaseline>
          <div className="App">
            <CssBaseline />
            <Provider store={store}>
              <LoginChecker />
              <Box sx={{ display: 'flex' }}>
                <TopBar />
                <Box component="main" sx={{ flexGrow: 1, p: 3, padding: 0 }}>
                  <Toolbar />
                  <Routing />
                </Box>
              </Box>
            </Provider>
          </div>
        </ScopedCssBaseline>
      </Router>
    </ThemeProvider >
  );
}

export default App;
