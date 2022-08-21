import * as React from 'react';
import Alert from "@mui/material/Alert"
import style from './toast.module.scss';
import { AlertTitle, Snackbar } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { CommonReducerType } from '../../../Reducer/CommonReducer';
import { RootState } from '../../../Reducer/reducerCombiner';
import { closeToast } from '../../../Actions/CommonAction';

type Props = {}

const Toast = (props: Props) => {
    const dispatch = useDispatch()
    const common: CommonReducerType = useSelector((state: RootState) => state.common);

    return (
        <Snackbar
            open={common.toast.open}
            autoHideDuration={common.toast.duration}
            onClose={() => {
                dispatch(closeToast())
            }}
            className={style.snackbar}
        >
            <div className={style.container}>
                <Alert
                    className={style.alert}
                    severity={common.toast.type}
                    sx={{ mb: 2 }}
                >
                    {common.toast.headline ? <AlertTitle>{common.toast.headline}</AlertTitle> : <></>}
                    {common.toast.message}
                </Alert>
            </div>
        </Snackbar>
    )
}

export default Toast