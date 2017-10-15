import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import theme from './theme';

const Title = styled.h1`
  font-size: 1.5em;
  text-align: center;
  color: ${props => props.theme.main};
`;

const Container = styled.div`
  max-width: 970px;
  margin: 0 auto;
`;

const App = ({ store }) => (
  <ThemeProvider theme={theme}>
    <Container>
      <Title>Hull Connector Boilerplate !</Title>
      <pre>{JSON.stringify(store.getState(), null, 2)}</pre>
    </Container>
  </ThemeProvider>
);

export default App;
