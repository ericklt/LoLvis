import React from 'react';
import {Link} from 'react-router-dom';

class Champions extends React.Component {
    myfunction(name) {
        console.log(name);
    }
    render() {
        const champions_names = ["Aatrox", "Ahri", "Akali", "Alistar", "Amumu", "Anivia", "Annie", "Ashe", "Aurelion_Sol", "Azir", "Bard", "Blitzcrank", "Brand", "Braum", "Caitlyn", "Camille", "Cassiopeia", "ChoGath", "Corki", "Darius", "Diana", "Dr.Mundo", "Draven", "Ekko", "Elise", "Evelynn", "Ezreal", "Fiddlesticks", "Fiora", "Fizz", "Galio", "Gangplank", "Garen", "Gnar", "Gragas", "Graves", "Hecarim", "Heimerdinger", "Illaoi", "Irelia", "Ivern", "Janna", "Jarvan_IV", "Jax", "Jayce", "Jhin", "Jinx", "Kalista", "Karma", "Karthus", "Kassadin", "Katarina", "Kayle", "Kayn", "Kennen", "KhaZix", "Kindred", "Kled", "KogMaw", "LeBlanc", "Lee_Sin", "Leona", "Lissandra", "Lucian", "Lulu", "Lux", "Malphite", "Malzahar", "Maokai", "Master_Yi", "Miss_Fortune", "Mordekaiser", "Morgana", "Nami", "Nasus", "Nautilus", "Nidalee", "Nocturne", "Nunu", "Olaf", "Orianna", "Ornn", "Pantheon", "Poppy", "Quinn", "Rakan", "Rammus", "RekSai", "Renekton", "Rengar", "Riven", "Rumble", "Ryze", "Sejuani", "Shaco", "Shen", "Shyvana", "Singed", "Sion", "Sivir", "Skarner", "Sona", "Soraka", "Swain", "Syndra", "Tahm_Kench", "Taliyah", "Talon", "Taric", "Teemo", "Thresh", "Tristana", "Trundle", "Tryndamere", "Twisted_Fate", "Twitch", "Udyr", "Urgot", "Varus", "Vayne", "Veigar", "VelKoz", "Vi", "Viktor", "Vladimir", "Volibear", "Warwick", "Wukong", "Xayah", "Xerath", "Xin_Zhao", "Yasuo", "Yorick", "Zac", "Zed", "Ziggs", "Zilean", "Zoe", "Zyra"];
        let id = 0;
        const champion_list = champions_names.map((name) => 
            <div className="col-md-2 col-sm-2 champ" key={id++}>
                <Link to={'/champions/'+name}>
                    <img src={process.env.PUBLIC_URL + '/images/Champions_Icons/' + name + 'Square.png'} className="col-md-12 col-sm-12 champ-img" alt="champ_img" />
                    <label className="champ-label col-md-12 col-sm-12">{name}</label>
                </Link>
            </div>
        );

        return (
            <div className="container">
                <div className="champ-title page-titles">
                    <h1>CAMPEÕES</h1>
                </div>
                <div className="champs">
                    {champion_list}
                </div>
            </div>
        );
    }
}
  
export default Champions;