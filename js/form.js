//Registro ID
document.querySelector('#formularioRegistro').addEventListener('submit', e => {
    e.preventDefault()
    const  data = Object.fromEntries(
        new FormData(e.target)
    )
    
    //Alert
    alert(JSON.stringify(data))
})
//Login ID
document.querySelector('#formularioLogin').addEventListener('submit', e => {
    e.preventDefault()
    const  data = Object.fromEntries(
        new FormData(e.target)
    )

    //Alert
    alert(JSON.stringify(data))
})