export const uploadImage = async(image) =>{
    try{
        const formData  = new FormData()
        formData.append("image", image)
        const res = await fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/upload-image`, {
            method: 'POST',
            body: formData
        })
        const data = await res.json();
        return data.url
    }
    catch(err){
        return err
    }
}