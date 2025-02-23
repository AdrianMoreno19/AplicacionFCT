const express = require('express');
const app = express();
const cors = require("cors"); // Importar CORS que sirve para no recibir errores en front
app.use(cors()); // Permitir peticiones desde otro origen
app.use(express.json()); // Middleware para parsear JSON en el cuerpo de la solicitud
app.use(express.urlencoded({ extended: true })); // Para procesar formularios con datos codificados en URL
const port = 3000;
const db = require('./db');

//Apartado de pruebas y plantillas

//Con app llamamos a nuestra aplicacion con express, get es para hacer una consulta select con crud
//db es la constante que hemos creado que llama al script de base de datos y query es la consulta
//req lo usamos cuando necesitamos recibir parametros y res es la respuesta que le mandamos al cliente
//err es un posible error
//result contiene los datos obtenidos de la base de datos y se los manda como array de objetos
//donde cada objeto representa un alumno con sus datos y genera un json con todos los datos
//Ruta para recoger los datos del alumno
app.get('/alumnos', (req, res) => {
    db.query('SELECT * FROM alumnos', (err, results) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err);
            res.status(500).json({ error: 'Error al obtener los datos' });
            return;
        }
        res.json(results);
    });
});

// Ruta para insertar un nuevo alumno
app.post('/alumnosInsert2', (req, res) => {
    //Recogemos los valores enviados por el formulario con req.body y se los metemos a las variables
    const { nombre_completo, fecha_nacimiento, genero, correo_electronico, telefono, direccion, centro_educativo, grado, estado_alumno, fecha_ingreso, notas_academicas, observaciones } = req.body;
    // Verificar que los campos obligatorios estén presentes
    if (!nombre_completo || !correo_electronico) {
        return res.status(400).json({ error: 'Nombre Completo y Correo Electrónico son obligatorios.' });
    }
    // Consulta SQL para insertar el nuevo alumno
    const query = `
        INSERT INTO alumnos
        (nombre_completo, fecha_nacimiento, genero, correo_electronico, telefono, direccion, centro_educativo, grado, estado_alumno, fecha_ingreso, notas_academicas, observaciones) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    // Ejecutamos la consulta
    //Lo que esta entre corchete son los parametros bindeados
    db.query(query, [nombre_completo, fecha_nacimiento, genero, correo_electronico, telefono, direccion, centro_educativo, grado, estado_alumno, fecha_ingreso, notas_academicas, observaciones], (err, result) => {
        if (err) {
            //Si la inserccion no ha salido correctamente se mandara un mensaje a la consola aparte del mensaje del cliente si ha habido un error
            console.error('Error al insertar el alumno:', err);
            return res.status(500).json({ error: 'Error al insertar el alumno.' });
        }
        // Si la inserción es exitosa, devolvemos un mensaje con el ID del nuevo alumno por consola aparte del mensaje por cliente si ha habido una respuesta
        //result.insertId: Este es el ID del nuevo registro que fue insertado. MySQL, al realizar una inserción con una columna AUTO_INCREMENT (como id en tu tabla de alumnos), 
        //genera automáticamente un valor único para esa columna. Este valor se encuentra en result.insertId.
        //Cuando insertas datos en una tabla con una columna AUTO_INCREMENT, MySQL automáticamente asigna un valor único para esa columna, y esa es la clave primaria (id en tu caso). El objeto result 
        //que devuelve la consulta INSERT contiene varios detalles, pero lo más relevante para ti es el ID del nuevo registro, que puedes acceder a través de insertId.
        //Asi le mandamos al cliente tambien el nombre completo que se ha insertado
        res.status(201).json({ message: 'Alumno insertado exitosamente', alumnoId: result.insertId, columnaNombreCompleto: 'nombre_completo' });
    });
});

//plantilla para el delete
app.delete('/alumnoDelete/:id', (req, res) => {
    const alumnoId = req.params.id;  // Obtener el ID desde los parámetros de la URL

    // Consulta SQL para eliminar el alumno por ID
    const query = 'DELETE FROM alumnos WHERE id = ?';

    db.query(query, [alumnoId], (err, result) => {
        if (err) {
            //Si ha ocurrido un error procedemos a mostrar en la consola un mensaje de error
            console.error('Error al eliminar el alumno:', err);
            return res.status(500).json({ error: 'Error al eliminar el alumno.' });
        }

        //result.affectedRows: Si la eliminación es exitosa, affectedRows será mayor que 0. Si es 0, significa que no se encontró ningún alumno con ese ID.
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Alumno no encontrado.' });
        }

        //Si todo ha salido bien entonces eliminamos el alumno
        //res es un objeto de respuestq que express nos deja por defecto status es un metodo que establece el codigo http que va a devolver al cliente
        //json es un metodo que indica la respuesta al cliente que es el formato comun para enviar datos entre servidor y cliente
        res.status(200).json({ message: 'Alumno eliminado exitosamente' });
    });
});

//Parte de update
// Ruta para actualizar un alumno
app.put('/alumnosUpdate/:id', (req, res) => {
    const alumnoId = req.params.id; // Tomamos el ID del parámetro de la URL
    // Obtenemos los nuevos valores desde el cuerpo de la solicitud
    const { nombre_completo, fecha_nacimiento, genero, correo_electronico, telefono, direccion, centro_educativo, grado, estado_alumno, fecha_ingreso, notas_academicas, observaciones } = req.body;
    // Verificamos si los campos obligatorios están presentes
    if (!nombre_completo || !correo_electronico) {
        return res.status(400).json({ error: 'Los campos Nombre Completo y Correo Electrónico son obligatorios.' });
    }
    // Consulta SQL para actualizar el alumno
    const query = `UPDATE alumnos SET nombre_completo = ?, fecha_nacimiento = ?, genero = ?, correo_electronico = ?,  telefono = ?, direccion = ?, centro_educativo = ?, grado = ?, estado_alumno = ?, fecha_ingreso = ?, notas_academicas = ?, observaciones = ? WHERE id = ?;`;
    // Ejecutamos la consulta
    // El ID del alumno que estamos actualizando
    db.query(query, [nombre_completo, fecha_nacimiento, genero, correo_electronico, telefono, direccion, centro_educativo, grado, estado_alumno, fecha_ingreso, notas_academicas, observaciones, alumnoId], (err, result) => {
        if (err) {
            //Si ha habido un error en la consulta le mandamos un error al cliente
            console.error('Error al actualizar el alumno:', err);
            return res.status(500).json({ error: 'Error al actualizar el alumno.' });
        }
        // Verificamos si la actualización se realizó correctamente
        if (result.affectedRows === 0) {
            //Si no recibimos ninguna columna por que no hay ningun id asociado entonces le mandamos un mensaje de error al cliente de que no se ha encontrado el alumno
            return res.status(404).json({ error: 'Alumno no encontrado.' });
        }
        //Si ha salido todo bien le mandamos un mensaje al cliente de que el alumno se ha actualizado correctamente
        res.status(200).json({ message: 'Alumno actualizado exitosamente' });
    });
});

//A PARTIR DE AQUI EMPIEZA EL BACK DE LA APLICACION FCT
//APARTADO PARA EL TUTOR
// Ruta para insertar un nuevo contacto de empresa
app.post('/contactoEmpresaInsert', (req, res) => {
    const Contacto = req.body;
    // Crear un array con los valores de las columnas (en el mismo orden que en la consulta SQL)
    const valores = [
        Contacto.nombre_completo,
        Contacto.cargo,
        Contacto.departamento,
        Contacto.correo_electronico,
        Contacto.telefono,
        Contacto.extension_telefonica,
        Contacto.direccion_oficina,
        Contacto.horario,
        Contacto.rol,
        Contacto.rol_empresa,
        Contacto.fecha_ingreso,
        Contacto.foto_perfil,
        Contacto.observaciones,
        Contacto.estado,
        Contacto.notas_adicionales
    ];
    //Creamos la query
    const query = "INSERT INTO contactos_empresas (nombre_completo,cargo,departamento,correo_electronico,telefono,extension_telefonica,direccion_oficina,horario,rol,rol_empresa,fecha_ingreso,foto_perfil,observaciones,estado,notas_adicionales) VALUES (?)";
    //aqui realizamos la query con el err y el result que es el resultado de la query
    db.query(query, [valores], (err, result) => {
        if (err) {
            //respondemos al cliente con un mensaje de error
            console.error('Error al insertar el contacto de empresa:', err);
            return res.status(500).json({ error: 'Error al insertar el contacto de empresa.' });
        }
        //respondemos al cliente con un mensaje correcto
        res.status(201).json({ message: 'Contacto de empresa insertado exitosamente'});
    });
});

// Apartado insertar Empresa
app.post('/EmpresaInsert', (req, res) => {
    const Empresa = req.body;
    //Creamos el array con los datos recibidos en el req.body de la parte del cliente
    const valores = [
        Empresa.nombre_empresa,
        Empresa.razon_social,
        Empresa.tipo_empresa,
        Empresa.nif_cif,
        Empresa.correo_empresa,
        Empresa.telefono_empresa,
        Empresa.direccion_empresa,
        Empresa.ciudad_empresa,
        Empresa.codigo_postal,
        Empresa.pais_empresa,
        Empresa.fecha_constitucion,
        Empresa.sector_empresa,
        Empresa.numero_empleados,
        Empresa.sitio_web,
        Empresa.logo_empresa,
        Empresa.representante_legal,
        Empresa.estado_empresa,
        Empresa.fecha_alta,
        Empresa.notas_adicionales
    ];
    //Creamos la query
    const query = "INSERT INTO empresas (nombre_empresa, razon_social, tipo_empresa, nif_cif, correo_empresa, telefono_empresa, direccion_empresa, ciudad_empresa, codigo_postal, pais_empresa, fecha_constitucion, sector_empresa, numero_empleados, sitio_web, logo_empresa, representante_legal, estado_empresa, fecha_alta, notas_adicionales) VALUES (?)";
    //aqui realizamos la query con el err y el result que es el resultado de la query
    db.query(query, [valores], (err, result) => {
        if (err) {
            //respondemos al cliente con un mensaje de error
            console.error('Error al insertar la Empresa:', err);
            return res.status(500).json({ error: 'Error al insertar la Empresa.' });
        }
        //respondemos al cliente con un mensaje correcto
        res.status(201).json({ message: `Empresa insertada exitosamente el id es ${result.insertId}` });
    });
});

//APARTADO PARA ADMINISTADOR
// Apartado insertar Profesor
app.post('/ProfeInsert', (req, res) => {
    const Profe = req.body;
    // Creamos el array con los datos recibidos en el req.body de la parte del cliente
    const valores = [
        Profe.nombre_completo,      // nombre_completo
        Profe.usuario,             // usuario
        Profe.correo_electronico,  // correo_electronico
        Profe.telefono,            // telefono
        Profe.direccion,           // direccion
        Profe.fecha_nacimiento,    // fecha_nacimiento
        Profe.genero,              // genero
        Profe.rol,                 // rol
        Profe.departamento,        // departamento
        Profe.tipo_contrato,       // tipo_contrato
        Profe.fecha_ingreso,       // fecha_ingreso
        Profe.foto_perfil,         // foto_perfil
        Profe.notas_adicionales,   // notas_adicionales
        Profe.contrasena           // contrasena
    ];
    //Creamos la query
    const query = "INSERT INTO profesores_fct (nombre_completo, usuario, correo_electronico, telefono, direccion, fecha_nacimiento, genero, rol, departamento, tipo_contrato, fecha_ingreso, foto_perfil, notas_adicionales, contrasena) VALUES (?)";
    //aqui realizamos la query con el err y el result que es el resultado de la query
    db.query(query, [valores], (err, result) => {
        if (err) {
            //respondemos al cliente con un mensaje de error
            console.error('Error al insertar el Profesor:', err);
            return res.status(500).json({ error: 'Error al insertar el Profesor.' });
        }
        //respondemos al cliente con un mensaje correcto
        res.status(201).json({ message: `Profesor insertado correctamente con el id ${result.insertId}` });
    });
});

// Apartado Actualiza Profesores
//Consulta recoge valores Profesores
app.get('/recogeProfesores/:id', (req, res) => {
    const idProfesor = req.params.id
    db.query('SELECT * FROM profesores_fct where id = ?', [idProfesor], (err, results) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err);
            res.status(500).json({ error: 'Error al obtener los datos' });
            return;
        }
        res.json(results);
    });
});

//Parte de update
// Ruta para actualizar un Profesores
app.put('/updateProfesor', (req, res) => {
    const profesor = req.body;
    const valores = [
        profesor.nombre_completo,
        profesor.usuario,
        profesor.correo_electronico,
        profesor.telefono,
        profesor.direccion,
        profesor.fecha_nacimiento,
        profesor.genero,
        profesor.rol,
        profesor.departamento,
        profesor.tipo_contrato,
        profesor.fecha_ingreso,
        profesor.foto_perfil,
        profesor.notas_adicionales,
        profesor.contrasena,
        profesor.id
    ];

    const query = `UPDATE profesores_fct SET nombre_completo = ?, usuario = ?, correo_electronico = ?, telefono = ?, direccion = ?, fecha_nacimiento = ?, genero = ?, rol = ?, departamento = ?, tipo_contrato = ?, fecha_ingreso = ?, foto_perfil = ?, notas_adicionales = ?, contrasena = ? WHERE id = ?;`;
    db.query(query, valores, (err, result) => {
        if (err) {
            console.error('Error al actualizar el Profesor:', err);
            return res.status(500).json({ error: 'Error al actualizar el Profesor.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Profesor no encontrado.' });
        }
        res.status(200).json({ message: 'Profesor actualizado exitosamente' });
    });
});

//Apartado delete para Profesores
app.delete('/deleteProfesor/:id', (req, res) => {
    const profesor = req.params.id;  // Obtener el ID desde los parámetros de la URL
    // Consulta SQL para eliminar el alumno por ID
    const query = 'DELETE FROM profesores_fct WHERE id = ?';
    db.query(query, [profesor], (err, result) => {
        if (err) {
            //Si ha ocurrido un error procedemos a mostrar en la consola un mensaje de error
            console.error('Error al eliminar el profesor:', err);
            return res.status(500).json({ error: 'Error al eliminar el profesor.' });
        }
        //result.affectedRows: Si la eliminación es exitosa, affectedRows será mayor que 0. Si es 0, significa que no se encontró ningún alumno con ese ID.
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'profesor no encontrado.' });
        }
        //Si todo ha salido bien entonces eliminamos el alumno
        //res es un objeto de respuestq que express nos deja por defecto status es un metodo que establece el codigo http que va a devolver al cliente
        //json es un metodo que indica la respuesta al cliente que es el formato comun para enviar datos entre servidor y cliente
        res.status(200).json({ message: 'profesor eliminado exitosamente' });
    });
});

//APARTADO PARA Profesores
// Apartado insertar Alumno
app.post('/AlumnoInsert', (req, res) => {
    const Alumno = req.body;
    // Creamos el array con los datos recibidos en el req.body de la parte del cliente
    const valores = [
        Alumno.nombre_completo,
        Alumno.fecha_nacimiento,
        Alumno.genero,
        Alumno.correo_electronico,
        Alumno.telefono,
        Alumno.direccion,
        Alumno.centro_educativo,
        Alumno.grado,
        Alumno.estado_alumno,
        Alumno.fecha_ingreso,
        Alumno.notas_academicas,
        Alumno.observaciones
    ];
    //Creamos la query
    const query = "INSERT INTO alumnos (nombre_completo, fecha_nacimiento, genero, correo_electronico, telefono, direccion, centro_educativo, grado, estado_alumno, fecha_ingreso, notas_academicas, observaciones) VALUES (?)";
    //aqui realizamos la query con el err y el result que es el resultado de la query
    db.query(query, [valores], (err, result) => {
        if (err) {
            //respondemos al cliente con un mensaje de error
            console.error('Error al insertar el Alumno:', err);
            return res.status(500).json({ error: 'Error al insertar el Alumno.' });
        }
        //respondemos al cliente con un mensaje correcto
        res.status(201).json({ message: `Alumno insertado correctamente con el id ${result.insertId}` });
    });
});

// Apartado elimina Alumnos
//Consulta recoge valores alumnos
/*app.get('/recogeAlumnos', (req, res) => {
    db.query('SELECT * FROM alumnos', (err, results) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err);
            res.status(500).json({ error: 'Error al obtener los datos' });
            return;
        }
        res.json(results);
    });
});*/

// Apartado Actualiza Alumnos
//Consulta recoge valores alumnos
app.get('/recogeAlumnos/:id', (req, res) => {
    const idAlumno = req.params.id
    db.query('SELECT * FROM alumnos where id = ?', [idAlumno], (err, results) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err);
            res.status(500).json({ error: 'Error al obtener los datos' });
            return;
        }
        res.json(results);
    });
});
//Parte de update
// Ruta para actualizar un alumno
app.put('/updateAlumnos', (req, res) => {
    const alumnos = req.body;
    const valores = [
        alumnos.nombre_completo,
        alumnos.fecha_nacimiento,
        alumnos.genero,
        alumnos.correo_electronico,
        alumnos.telefono,
        alumnos.direccion,
        alumnos.centro_educativo,
        alumnos.grado,
        alumnos.estado_alumno,
        alumnos.fecha_ingreso,
        alumnos.notas_academicas,
        alumnos.observaciones,
        alumnos.id
    ];
    const query = `UPDATE alumnos SET nombre_completo = ?, fecha_nacimiento = ?, genero = ?, correo_electronico = ?,  telefono = ?, direccion = ?, centro_educativo = ?, grado = ?, estado_alumno = ?, fecha_ingreso = ?, notas_academicas = ?, observaciones = ? WHERE id = ?;`;
    db.query(query, valores, (err, result) => {
        if (err) {
            console.error('Error al actualizar el alumno:', err);
            return res.status(500).json({ error: 'Error al actualizar el alumno.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Alumno no encontrado.' });
        }
        res.status(200).json({ message: 'Alumno actualizado exitosamente' });
    });
});

//Apartado delete para alumnos
app.delete('/deleteAlumnos/:id', (req, res) => {
    const alumno = req.params.id;  // Obtener el ID desde los parámetros de la URL
    // Consulta SQL para eliminar el alumno por ID
    const query = 'DELETE FROM alumnos WHERE id = ?';
    db.query(query, [alumno], (err, result) => {
        if (err) {
            //Si ha ocurrido un error procedemos a mostrar en la consola un mensaje de error
            console.error('Error al eliminar el Alumno:', err);
            return res.status(500).json({ error: 'Error al eliminar el Alumno.' });
        }
        //result.affectedRows: Si la eliminación es exitosa, affectedRows será mayor que 0. Si es 0, significa que no se encontró ningún alumno con ese ID.
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Alumno no encontrado.' });
        }
        //Si todo ha salido bien entonces eliminamos el alumno
        //res es un objeto de respuestq que express nos deja por defecto status es un metodo que establece el codigo http que va a devolver al cliente
        //json es un metodo que indica la respuesta al cliente que es el formato comun para enviar datos entre servidor y cliente
        res.status(200).json({ message: 'Alumno eliminado exitosamente' });
    });
});

// Apartado Actualiza Empresas
//Consulta recoge valores Empresas
app.get('/recogeEmpresas/:id', (req, res) => {
    const idEmpresa = req.params.id
    db.query('SELECT * FROM empresas where id = ?', [idEmpresa], (err, results) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err);
            res.status(500).json({ error: 'Error al obtener los datos' });
            return;
        }
        res.json(results);
    });
});
//Parte de update
// Ruta para actualizar un Empresas
app.put('/updateEmpresa', (req, res) => {
    const empresas = req.body;
    const valores = [
        empresas.nombre_empresa,
        empresas.razon_social,
        empresas.tipo_empresa,
        empresas.nif_cif,
        empresas.correo_empresa,
        empresas.telefono_empresa,
        empresas.direccion_empresa,
        empresas.ciudad_empresa,
        empresas.codigo_postal,
        empresas.pais_empresa,
        empresas.fecha_constitucion,
        empresas.sector_empresa,
        empresas.numero_empleados,
        empresas.sitio_web,
        empresas.logo_empresa,
        empresas.representante_legal,
        empresas.estado_empresa,
        empresas.fecha_alta,
        empresas.notas_adicionales,
        empresas.id
    ];
    const query = `UPDATE empresas SET nombre_empresa = ?, razon_social = ?, tipo_empresa = ?, nif_cif = ?, correo_empresa = ?, telefono_empresa = ?, direccion_empresa = ?, ciudad_empresa = ?, codigo_postal = ?, pais_empresa = ?, fecha_constitucion = ?, sector_empresa = ?, numero_empleados = ?, sitio_web = ?, logo_empresa = ?, representante_legal = ?, estado_empresa = ?, fecha_alta = ?, notas_adicionales = ? WHERE id = ?;`;
    db.query(query, valores, (err, result) => {
        if (err) {
            console.error('Error al actualizar el alumno:', err);
            return res.status(500).json({ error: 'Error al actualizar la empresa.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Empresa no encontrado.' });
        }
        res.status(200).json({ message: 'Empresa actualizada exitosamente' });
    });
});

//Apartado delete para Empresas
app.delete('/deleteEmpresa/:id', (req, res) => {
    const empresa = req.params.id;  // Obtener el ID desde los parámetros de la URL
    // Consulta SQL para eliminar el alumno por ID
    const query = 'DELETE FROM empresas WHERE id = ?';
    db.query(query, [empresa], (err, result) => {
        if (err) {
            //Si ha ocurrido un error procedemos a mostrar en la consola un mensaje de error
            console.error('Error al eliminar la Empresa:', err);
            return res.status(500).json({ error: 'Error al eliminar la Empresa.' });
        }
        //result.affectedRows: Si la eliminación es exitosa, affectedRows será mayor que 0. Si es 0, significa que no se encontró ningún alumno con ese ID.
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Empresa no encontrado.' });
        }
        //Si todo ha salido bien entonces eliminamos el alumno
        //res es un objeto de respuestq que express nos deja por defecto status es un metodo que establece el codigo http que va a devolver al cliente
        //json es un metodo que indica la respuesta al cliente que es el formato comun para enviar datos entre servidor y cliente
        res.status(200).json({ message: 'Empresa eliminada exitosamente' });
    });
});

// Apartado Actualiza Contacto Empresas
//Consulta recoge valores Contacto Empresas
app.get('/recogeContactoEmpresas/:id', (req, res) => {
    const idContactoEmpresa = req.params.id
    db.query('SELECT * FROM contactos_empresas where id = ?', [idContactoEmpresa], (err, results) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err);
            res.status(500).json({ error: 'Error al obtener los datos' });
            return;
        }
        res.json(results);
    });
});
//Parte de update
// Ruta para actualizar un Contacto Empresas
app.put('/updateContactoEmpresa', (req, res) => {
    const contactoEmpresa = req.body;
    const valores = [
        contactoEmpresa.nombre_completo,
        contactoEmpresa.cargo,
        contactoEmpresa.departamento,
        contactoEmpresa.correo_electronico,
        contactoEmpresa.telefono,
        contactoEmpresa.extension_telefonica,
        contactoEmpresa.direccion_oficina,
        contactoEmpresa.horario,
        contactoEmpresa.rol,
        contactoEmpresa.rol_empresa,
        contactoEmpresa.fecha_ingreso,
        contactoEmpresa.foto_perfil,
        contactoEmpresa.observaciones,
        contactoEmpresa.estado,
        contactoEmpresa.notas_adicionales,
        contactoEmpresa.id
    ];
    const query = `UPDATE contactos_empresas SET nombre_completo = ?, cargo = ?, departamento = ?, correo_electronico = ?, telefono = ?, extension_telefonica = ?, direccion_oficina = ?, horario = ?, rol = ?, rol_empresa = ?, fecha_ingreso = ?, foto_perfil = ?, observaciones = ?, estado = ?, notas_adicionales = ? WHERE id = ?;`;
    db.query(query, valores, (err, result) => {
        if (err) {
            console.error('Error al actualizar el Contacto Empresas:', err);
            return res.status(500).json({ error: 'Error al actualizar el Contacto Empresas.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Contacto Empresas no encontrado.' });
        }
        res.status(200).json({ message: 'Contacto Empresas actualizada exitosamente' });
    });
});

//Apartado delete para Contacto Empresas
app.delete('/deleteContactoEmpresa/:id', (req, res) => {
    const contactoEmpresa = req.params.id;  // Obtener el ID desde los parámetros de la URL
    // Consulta SQL para eliminar el alumno por ID
    const query = 'DELETE FROM contactos_empresas WHERE id = ?';
    db.query(query, [contactoEmpresa], (err, result) => {
        if (err) {
            //Si ha ocurrido un error procedemos a mostrar en la consola un mensaje de error
            console.error('Error al eliminar el contacto empresa:', err);
            return res.status(500).json({ error: 'Error al eliminar el contacto empresa.' });
        }
        //result.affectedRows: Si la eliminación es exitosa, affectedRows será mayor que 0. Si es 0, significa que no se encontró ningún alumno con ese ID.
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Contacto empresa no encontrado.' });
        }
        //Si todo ha salido bien entonces eliminamos el alumno
        //res es un objeto de respuestq que express nos deja por defecto status es un metodo que establece el codigo http que va a devolver al cliente
        //json es un metodo que indica la respuesta al cliente que es el formato comun para enviar datos entre servidor y cliente
        res.status(200).json({ message: 'Contacto empresa eliminada exitosamente' });
    });
});

app.use(express.static("../frontend")); // Servir HTML desde frontend

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});