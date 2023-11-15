import React from 'react'
import CuponDisplay from './CuponDisplay'
import { Button, Stack, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import style from './cupon.module.scss';
import Spacer from '../../Common/Spacer';
import { useNavigate } from 'react-router-dom';

type Props = {}

const Overview = (props: Props) => {
  const navigate = useNavigate();
  return (
    <div className={style.cuponsPage}>
      <Stack direction="row" alignItems="center" justifyContent="flex-start" gap={5}>
        <Typography variant='h3'>
          Cupons
        </Typography>
        <Button variant="outlined" color="primary" onClick={()=>{navigate("add")}}>
          <AddIcon />
        </Button>
      </Stack>
      <Spacer vertical={15} />
      <Stack direction="row" alignItems="center" justifyContent="flex-start" gap={1} flexWrap={"wrap"}>
      <CuponDisplay />
      <CuponDisplay />
      <CuponDisplay />
      <CuponDisplay />
      <CuponDisplay />
      </Stack>
    </div>
  )
}

export default Overview