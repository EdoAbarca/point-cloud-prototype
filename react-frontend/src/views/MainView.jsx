import { Link } from "react-router-dom"

const MainView = () => {
    return (
        <div className="text-center">
            <h1>Prototipo nubes de punto</h1>
            <p>Eduardo Abarca</p>
            <div className="flex flex-row">
                <Link to="/points">Visualizar nube de puntos</Link>
                <Link to="/meshes">Visualizar mallas</Link>
                <Link to="/create-mesh">Crear malla</Link>
            </div>
        </div>
    )
}

export default MainView