import{BrowserRouter,Routes,Route,Navigate} from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Dashboard from './Dashboard';
import Queue from './Queue';
import SignUp from './Signup';
export default function App() {
    return (<BrowserRouter>
        <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/loginUser" element={<Login/>}/>
            <Route path="/registerUser" element={<SignUp/>}/>
            <Route path="/dashboard" element={<Dashboard/>}/>
            <Route path="/queue" element={<Queue/>}/>
        </Routes>
    </BrowserRouter>)
}


