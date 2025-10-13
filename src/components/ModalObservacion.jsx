
export const ModalObservacion=({show,onClose,data})=>{
    if (!show) return null;
    return(
<div className="modal show d-block" tabindex="-1">
  <div className="modal-dialog">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">Observacion</h5>
        
      </div>
      <div className="modal-body">
        <p>{data?.observacion ? data?.observacion : "Sin Observaciones"}</p>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  </div>
</div>
    )
}