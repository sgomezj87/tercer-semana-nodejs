const express = require('express')
const app = express ()
const path = require('path')
const hbs = require ('hbs')
const Estudiante = require('./../models/estudiante')
const dirViews = path.join(__dirname, '../../template/views')
const dirPartials = path.join(__dirname, '../../template/partials')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('./../helpers/helpers')

//hbs
app.set('view engine', 'hbs')
app.set('views', dirViews)
hbs.registerPartials(dirPartials)


app.get('/', (req, res ) => {
	res.render('index', {
		titulo: 'Inicio',
	})	
});

app.post('/', (req, res ) => {

	let estudiante = new Estudiante ({
		nombre : req.body.nombre,
		matematicas : req.body.matematicas,
		ingles : req.body.ingles,
		programacion : 	req.body.programacion,
		password : bcrypt.hashSync(req.body.password, 10)
		
	})

	estudiante.save((err, resultado) => {
		if (err){
			return res.render ('indexpost', {
				mostrar : err
			})			
		}		
		res.render ('indexpost', {			
				mostrar : resultado.nombre
			})		
	})			
});

app.get('/vernotas', (req,res) => {

	Estudiante.find({},(err,respuesta)=>{
		if (err){
			return console.log(err)
		}

		res.render ('vernotas',{
			listado : respuesta
		})
	})
})

app.get('/actualizar', (req, res) => {	

		Estudiante.findById(req.session.usuario, (err, usuario) =>{
			//Estudiante.findById(req.usuario, (err, usuario) =>{
			if (err){
				return console.log(err)
			}

			if (!usuario){
			return res.redirect('/')
		}
			res.render ('actualizar',{
				nombre : usuario.nombre,
				matematicas : usuario.matematicas,
				ingles : usuario.ingles,
				programacion : usuario.programacion
			})
		});
	})	

app.post('/actualizar', (req, res) => {
	
	Estudiante.findOneAndUpdate({nombre : req.body.nombre}, req.body, {new : true, runValidators: true, context: 'query' }, (err, resultados) => {
		if (err){
			return console.log(err)
		}

		res.render ('actualizar', {
			nombre : resultados.nombre,
			matematicas : resultados.matematicas,
			ingles : resultados.ingles,
			programacion : resultados.programacion
		})
	})	
})

app.post('/eliminar', (req, res) => {
	
	Estudiante.findOneAndDelete({nombre : req.body.nombre}, req.body, (err, resultados) => {
		if (err){
			return console.log(err)
		}

		if(!resultado){
			res.render ('eliminar', {
			nombre : "no encontrado"			
		})

		}

		res.render ('eliminar', {
			nombre : resultados.nombre			
		})
	})	
})


app.post('/ingresar', (req, res) => {	
	Estudiante.findOne({nombre : req.body.usuario}, (err, resultados) => {
		if (err){
			return console.log(err)
		}
		if(!resultados){
			return res.render ('ingresar', {
			mensaje : "Usuario no encontrado"			
			})
		}
		if(!bcrypt.compareSync(req.body.password, resultados.password)){
			return res.render ('ingresar', {
			mensaje : "Contraseña no es correcta"			
			})
		}	
			//Para crear las variables de sesión
			req.session.usuario = resultados._id	
			req.session.nombre = resultados.nombre

			// let token = jwt.sign({
   //          	usuario: resultados
   //      	}, 'virtual-tdea', { expiresIn: '12h' });
			// console.log(token)

			// localStorage.setItem('token', token);
			
			res.render('ingresar', {
						mensaje : "Bienvenido " + resultados.nombre,
						nombre : resultados.nombre,
						sesion : true						
						 })
	})	
})

app.get('/salir', (req, res) => {
	req.session.destroy((err) => {
  		if (err) return console.log(err) 	
	})	
	// localStorage.setItem('token', '');
	res.redirect('/')	
})

app.get('*',(req,res)=> {
	res.render('error', {
		titulo: "Error 404",		
	})
});

module.exports = app