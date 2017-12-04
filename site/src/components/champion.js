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
                        <p>BLAH BLAH BLAJ BLAH BLAH BLHA</p>
                    </div>
                    <div className="col-md-12 col-sm-12">
                        <p>graficos graficos graficos</p>
                    </div>
                </div>
            </div>
        );
    }
}

export default Champion;
