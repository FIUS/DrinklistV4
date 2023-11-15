import { Stack, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'
import style from './cupon.module.scss';
import { MuiColorInput } from 'mui-color-input';

type Props = {}

const AddCupon = (props: Props) => {
    const [color, setcolor] = useState("#ffdd00")
    return (
        <div className={style.addCuponPage}>
            <Stack flexDirection={"row"} alignItems={"center"} flexWrap={"wrap"} gap={2}>
                <TextField label="Cupon Name" variant="outlined" />
                <MuiColorInput value={color} onChange={(value)=>{setcolor(value)}} />
            </Stack>
        </div>
    )
}

export default AddCupon