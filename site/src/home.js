import React from 'react';
<<<<<<< HEAD
import Charts from './components/charts';
import Winrate from './components/charts/winrate';
import Popular from './components/charts/popular';
import Winpop from './components/charts/winpop';

=======
import General from './components/general'
>>>>>>> 4b235e7a4e07c1ed44780aa003c6de2d641000c3

class Home extends React.Component {
  render() {
    return(
<<<<<<< HEAD
      <div className="container champ-title">
        <div className="home-header">
          <h1>Seja bem vindo ao League Vis_</h1>
          <h4>Aqui você pode encontrar algumas visualizações bem interessantes sobre os Campeões do nosso querido Lolzin</h4>
          <h4>Não deixe de acessar a Campeões para dados individuais de cada um, Classificação para saber quais os mais populares ou que vencem mais partidas e Mapa para observar quando e onde os Campeões
            morrem!
          </h4>
        </div>
        <div className="charts-div">
          <br />
          <br />
          <h1>Visualizações Gerais</h1>
          <Winrate />
          <Popular />
          <Winpop />
        </div>
      </div>
=======
      <General />
>>>>>>> 4b235e7a4e07c1ed44780aa003c6de2d641000c3
    );
  }
}

export default Home;
