import { Box, Button, ButtonGroup, Dialog, DialogContent, DialogTitle, Paper, Stack, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import style from './details.module.scss'
import Spacer from '../../Common/Spacer'
import { Drink } from '../../../types/ResponseTypes'

type Props = {
    drinks: Array<Drink> | null
    buyDrink: (drink: Drink | null) => void
    open: boolean
}

const drinkBuytimeout = 7000



interface RectangularPaperWithLabelProps {
    value: number; // 0 to 100
    drinkName: string;
    drinkPrice: number;
    width?: number | string;
    height?: number | string;
    buyDrink: () => void
}

const RectangularPaperWithLabel: React.FC<RectangularPaperWithLabelProps> = ({
    value,
    drinkName,
    drinkPrice,
    width = 200,
    height = 100,
    buyDrink
}) => {
    const progress = value; // progress from 0 to 100

    // Ensure numeric dimensions (if passed as numbers or parse strings)
    const numericWidth = typeof width === 'number' ? width : parseInt(width, 10) || 200;
    const numericHeight = typeof height === 'number' ? height : parseInt(height, 10) || 100;

    const strokeWidth = 3;
    // Adjust for stroke so the border fits inside
    const adjustedWidth = numericWidth - strokeWidth;
    const adjustedHeight = numericHeight - strokeWidth;
    const perimeter = 2 * (adjustedWidth + adjustedHeight);
    // Compute strokeDashoffset based on progress
    const offset = perimeter - (progress / 100) * perimeter;

    return (
        <Paper
            elevation={3}
            sx={{
                position: 'relative',
                width,
                height,
                overflow: 'hidden',
                padding: 2,
            }}
        >
            {/* SVG overlay to render the evolving border */}
            <Box
                component="svg"
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                }}
            >
                <rect
                    x={strokeWidth / 2}
                    y={strokeWidth / 2}
                    width={adjustedWidth}
                    height={adjustedHeight}
                    fill="none"
                    stroke="currentColor" // Uses the theme’s current color
                    strokeWidth={strokeWidth}
                    strokeDasharray={perimeter}
                    strokeDashoffset={offset}
                    style={{
                        transition: 'stroke-dashoffset 0.5s ease-in-out',
                    }}
                />
            </Box>
            {/* Content with the centered label */}
            <Box
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            ><Button variant='text' onClick={() => buyDrink()}>
                    <Stack flexDirection={"column"} justifyContent={"center"} alignItems={"center"} gap={1}>

                        <Typography
                            variant="h6"
                            component="div"
                        >
                            {drinkName}
                        </Typography>
                        <Typography
                            variant="caption"
                            component="div"
                        >
                            {drinkPrice.toFixed(2)}€
                        </Typography>

                    </Stack>
                </Button>
            </Box>
        </Paper>
    );
};




const AIDrinkDialog = (props: Props) => {

    const [progress, setProgress] = React.useState(100);

    const tickTime = 250

    useEffect(() => {
        if (!props.open) {
            return
        }
        const timer = setInterval(() => {
            setProgress((prevProgress) => {
                const newProgress = prevProgress - 100 / (drinkBuytimeout / tickTime);

                if (newProgress <= 0) {
                    props.buyDrink(props.drinks ? props.drinks[0] : null);
                    return 100; // Reset progress
                }

                return newProgress;
            });
        }, tickTime);

        return () => clearInterval(timer);
    }, [tickTime, props, props.buyDrink, props.drinks, props.open]); // Avoid `progress` in dependencies


    if (props.drinks && props.drinks.length < 4) {
        return
    }

    const closeDialog = (drinkIndex: number | null) => {
        if (drinkIndex === null) {
            props.buyDrink(null);
        } else {
            props.buyDrink(props.drinks ? props.drinks[drinkIndex] : null);
        }
        setProgress(100)
    }

    return (
        <Dialog open={props.open} onClose={() => { }} sx={{ zIndex: 20000000 }} >
            <DialogTitle>Getränk erkannt</DialogTitle>
            <DialogContent className={style.transferBox}>
                <Stack flexDirection={"column"} justifyContent={"center"} alignItems={"center"} gap={2}>
                    <RectangularPaperWithLabel value={progress} buyDrink={() => { closeDialog(0) }} drinkName={props.drinks ? props.drinks[0].name : ""} drinkPrice={props.drinks ? props.drinks[0].price : 0} />
                    <Typography variant='overline'>Alternative Vorschläge</Typography>
                    <ButtonGroup variant="outlined" aria-label="Basic button group">
                        <Button onClick={() => { closeDialog(1) }}>{props.drinks ? props.drinks[1].name : ""}</Button>
                        <Button onClick={() => { closeDialog(2) }}>{props.drinks ? props.drinks[2].name : ""}</Button>
                        <Button onClick={() => { closeDialog(3) }}>{props.drinks ? props.drinks[3].name : ""}</Button>
                    </ButtonGroup>
                    <Spacer vertical={5} />
                    <Button variant="contained" color="primary" style={{ width: "100%" }} onClick={() => { closeDialog(null) }}>Abbrechen</Button>
                </Stack>
            </DialogContent>
        </Dialog>
    )
}

export default AIDrinkDialog