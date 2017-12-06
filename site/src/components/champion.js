import React from 'react';

class Champion extends React.Component {

    render() {
        const name = this.props.match.params.name
        return (
            <div className="container champs-container">
                <div className="champ-title page-titles">
                    <h1>{name}</h1>
                </div>
                <div className="champs">
                    <div className="col-md-3 col-sm-3">
                        <img src={"../static/images/Champions_Icons/" + name + "Square.png"} alt="champ_img" />
                    </div>
                    <div className="col-md-9 col-sm-9">
                        <div>
                            <h4>Colocar aqui quais lanes que ele joga!!</h4>
                        </div>
                    </div>
                    <div className="col-md-12 col-sm-12">
                        <div className="col-md-4 col-sm-4">
                            <h4>win rate !!!</h4>
                        </div> 
                        <div className="col-md-4 col-sm-4">
                            <h4>pick rate !!!</h4>
                        </div>
                        <div className="col-md-4 col-sm-4">
                            <h4>ban rate !!!</h4>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Champion;
