import React from 'react';
import Charts from './components/charts';
import Winrate from './components/charts/winrate';
import Popular from './components/charts/popular';
import Winpop from './components/charts/winpop';
import General from './components/general'

class Home extends React.Component {
  render() {
    return(
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
          <General />
        </div>
      </div>
    );
  }
}

export default Home;
