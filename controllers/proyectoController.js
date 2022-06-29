import Proyecto from "../models/Proyectos.js";
import Tarea from "../models/Tarea.js";
import Usuario from "../models/Usuario.js";

const obtenerProyectos = async (req, res) => {
  const proyectos = await Proyecto.find({
    $or: [
      { colaboradores: { $in: req.usuario } },
      { creador: { $in: req.usuario } },
    ],
  }).select("-tareas");

  res.json(proyectos);
};

const nuevoProyecto = async (req, res) => {
  const proyecto = new Proyecto(req.body);
  proyecto.creador = req.usuario._id;

  try {
    const proyectoAlmacenado = await proyecto.save();
    res.json(proyectoAlmacenado);
  } catch (err) {
    console.error(err);
  }
};

const obtenerProyecto = async (req, res) => {
  const { id } = req.params;

  const proyecto = await Proyecto.findById(id)
    .populate("tareas")
    .populate("colaboradores", "nombre email");

  if (!proyecto) {
    const error = new Error("Proyecto no encontrado");
    return res.status(404).json({ msg: error.message });
  }

  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Accion no valida");
    return res.status(401).json({ msg: error.message });
  }

  res.json(proyecto);
};

const editarProyecto = async (req, res) => {
  const { id } = req.params;

  const proyecto = await Proyecto.findById(id);

  if (!proyecto) {
    const error = new Error("Proyecto no encontrado");
    return res.status(404).json({ msg: error.message });
  }

  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Accion no valida");
    return res.status(401).json({ msg: error.message });
  }

  proyecto.nombre = req.body.nombre || proyecto.nombre;
  proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
  proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
  proyecto.cliente = req.body.cliente || proyecto.cliente;

  try {
    const proyectoAlmacenado = await proyecto.save();
    return res.json(proyectoAlmacenado);
  } catch (error) {
    console.log(error);
  }
};

const eliminarProyecto = async (req, res) => {
  const { id } = req.params;

  const proyecto = await Proyecto.findById(id);

  if (!proyecto) {
    const error = new Error("Proyecto no encontrado");
    return res.status(404).json({ msg: error.message });
  }

  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Accion no valida");
    return res.status(401).json({ msg: error.message });
  }

  try {
    proyecto.deleteOne();
    res.json({ msg: "Proyecto Eliminado" });
  } catch (error) {
    console.log(error);
  }
};

const buscarColaborador = async (req, res) => {
  const { email } = req.body;
  const usuario = await Usuario.findOne({ email }).select(
    "-confirmado -createdAt -updatedAt -password -token -__v"
  );

  if (!usuario) {
    const error = new Error("Usuario no encontrado");
    return res.status(404).json({ msg: error.message });
  }

  res.json(usuario);
};

const agregarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id);

  if (!proyecto) {
    const error = new Error("Proyecto no encontrado");
    return res.status(404).json({ msg: error.message });
  }

  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Accion no valida");
    return res.status(401).json({ msg: error.message });
  }

  const { email } = req.body;
  const usuario = await Usuario.findOne({ email }).select(
    "-confirmado -createdAt -updatedAt -password -token -__v"
  );

  if (!usuario) {
    const error = new Error("Usuario no encontrado");
    return res.status(404).json({ msg: error.message });
  }

  //El colaborador no es el admin
  if (proyecto.creador.toString() === usuario._id.toString()) {
    const error = new Error("No puedes agregarte a ti mismo");
    return res.status(404).json({ msg: error.message });
  }

  //Revisar que no este agregado al proyecto
  if (proyecto.colaboradores.includes(usuario._id)) {
    const error = new Error("El usuario ya esta agregado");
    return res.status(404).json({ msg: error.message });
  }

  //Agregar al proyecto
  proyecto.colaboradores.push(usuario._id);
  await proyecto.save();
  res.json({ msg: "Colaborador Agregado Correctamente" });
};

const eliminarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id);

  if (!proyecto) {
    const error = new Error("Proyecto no encontrado");
    return res.status(404).json({ msg: error.message });
  }

  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Accion no valida");
    return res.status(401).json({ msg: error.message });
  }
  //Eliminar del proyecto
  proyecto.colaboradores.pull(req.body.id);
  await proyecto.save();
  res.json({ msg: "Colaborador Eliminado Correctamente" });
};

export {
  obtenerProyectos,
  nuevoProyecto,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  agregarColaborador,
  eliminarColaborador,
  buscarColaborador,
};
