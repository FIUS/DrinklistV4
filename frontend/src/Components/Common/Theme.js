import { createTheme } from '@mui/material/styles';

const darkPrimary = "#03293a"
const darkPrimaryLighter = "#054461"
const darkPrimaryLight = "#086691"
const darkBackground = "#02101c"
const darkFont = "#ECB365"
const darkButtonFont = "#fafafa"
const darkButtonFontDark = "#0f0f0f"
const darkButtonFontDisabled = "#c0c0c0"
const darkButtonBorder = "#c8c8c8"
const darkButtonBorderHover = "#989898"
const darkPaperBackground = "#041d34"
const darkNotActive = "#989898"

export const darkTheme1 = createTheme({
    palette: {
        primary: {
            main: darkPrimary
        },
        background: {
            default: darkBackground
        },
        text: {
            primary: darkFont
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    color: darkButtonFont,
                    ":disabled": {
                        color: darkButtonFontDisabled
                    }
                },
                outlined: {
                    borderColor: darkButtonBorder,
                    '&:hover': {
                        borderColor: darkButtonBorderHover
                    }
                }
            },
        },
        MuiCheckbox: {
            styleOverrides: {
                root: {
                    "&.Mui-checked": {
                        color: darkButtonFontDark + "!important"
                    }
                }
            }
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    "&.Mui-focused fieldset": {
                        borderColor: darkButtonBorder + '!important',
                    }
                },
                notchedOutline: {
                    borderColor: darkButtonBorder,

                },
            }
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: darkPaperBackground
                }
            }
        }, MuiListItemIcon: {
            styleOverrides: {
                root: {
                    color: darkFont
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundColor: darkPaperBackground
                }
            }
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    color: darkButtonFont,
                    ":disabled": {
                        color: darkFont,
                    },
                },
            }
        },
        MuiInput: {
            styleOverrides: {
                root: {
                    ":before": {
                        borderBottom: "1px solid " + darkFont,
                    },
                }
            }
        },
        MuiStepIcon: {
            styleOverrides: {
                root: {
                    color: darkNotActive,
                }
            }
        },
        MuiStepLabel: {
            styleOverrides: {
                label: {
                    color: darkNotActive
                }
            }
        }, MuiSvgIcon: {
            styleOverrides: {
                root: {
                    color: darkFont,
                }
            }
        }, MuiToggleButton: {
            styleOverrides: {
                root: {
                    color: darkNotActive,
                    border: "1px solid " + darkNotActive
                }
            }
        }, MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: darkNotActive,
                    "&.Mui-focused": {
                        color: darkButtonBorder
                    }
                }
            }
        }, MuiDivider: {
            styleOverrides: {
                root: {
                    borderColor: darkPrimary
                }
            }
        }, MuiSwitch: {
            styleOverrides: {
                switchBase: {
                    "&.Mui-checked": {
                        color: darkPrimaryLight
                    },
                    "&.Mui-checked+.MuiSwitch-track": {
                        backgroundColor: darkPrimaryLighter
                    }
                },
                track: {
                    "&.Mui-checked": {
                        color: "red"
                    }
                }
            }
        }, MuiTypography: {
            styleOverrides: {
                root: {
                    color: darkFont + "!important"
                }
            }
        }, MuiSelect: {
            styleOverrides: {
                icon: {
                    color: darkButtonFont
                }
            }
        }
    },
});


const darkFont2 = "#a0cdf8"


export const darkTheme2 = createTheme({
    palette: {
        primary: {
            main: darkPrimary
        },
        background: {
            default: darkBackground
        },
        text: {
            primary: darkFont2
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    color: darkButtonFont,
                    ":disabled": {
                        color: darkButtonFontDisabled
                    }
                },
                outlined: {
                    borderColor: darkButtonBorder,
                    '&:hover': {
                        borderColor: darkButtonBorderHover
                    }
                }
            },
        },
        MuiCheckbox: {
            styleOverrides: {
                root: {
                    "&.Mui-checked": {
                        color: darkButtonFontDark + "!important"
                    }
                }
            }
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    "&.Mui-focused fieldset": {
                        borderColor: darkButtonBorder + '!important',
                    }
                },
                notchedOutline: {
                    borderColor: darkButtonBorder,

                },
            }
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: darkPaperBackground
                }
            }
        }, MuiListItemIcon: {
            styleOverrides: {
                root: {
                    color: darkFont2
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundColor: darkPaperBackground
                }
            }
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    color: darkButtonFont,
                    ":disabled": {
                        color: darkFont2,
                    },
                },
            }
        },
        MuiInput: {
            styleOverrides: {
                root: {
                    ":before": {
                        borderBottom: "1px solid " + darkFont2,
                    },
                }
            }
        },
        MuiStepIcon: {
            styleOverrides: {
                root: {
                    color: darkNotActive,
                }
            }
        },
        MuiStepLabel: {
            styleOverrides: {
                label: {
                    color: darkNotActive
                }
            }
        },
        MuiSvgIcon: {
            styleOverrides: {
                root: {
                    color: darkFont2,
                }
            }
        }, MuiToggleButton: {
            styleOverrides: {
                root: {
                    color: darkNotActive,
                    border: "1px solid " + darkNotActive
                }
            }
        }, MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: darkNotActive,
                    "&.Mui-focused": {
                        color: darkButtonBorder
                    }
                }
            }
        }, MuiDivider: {
            styleOverrides: {
                root: {
                    borderColor: darkPrimary
                }
            }
        }, MuiSwitch: {
            styleOverrides: {
                switchBase: {
                    "&.Mui-checked": {
                        color: darkPrimaryLight
                    },
                    "&.Mui-checked+.MuiSwitch-track": {
                        backgroundColor: darkPrimaryLighter
                    }
                },
                track: {
                    "&.Mui-checked": {
                        color: "red"
                    }
                }
            }
        }, MuiTypography: {
            styleOverrides: {
                root: {
                    color: darkFont2 + "!important"
                }
            }
        }, MuiSelect: {
            styleOverrides: {
                icon: {
                    color: darkButtonFont
                }
            }
        }
    },
});

const normalPrimary = '#c4daff'
const normalBackground = '#fbfbfb'
const normalText = '#000000'
const success = '#88d32d'

export const normalTheme = createTheme({
    palette: {
        primary: {
            main: normalPrimary
        },
        background: {
            default: normalBackground
        },
        text: {
            primary: normalText
        },
        success: {
            main: success
        }
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    color: '#000000',
                },
                outlined: {
                    borderColor: "#c8c8c8",
                    '&:hover': {
                        borderColor: '#989898'
                    }
                }
            },
        }, MuiCollapse: {
            styleOverrides: {
                root: {
                    backgroundColor: "white"
                }
            }
        }, MuiAccordion: {
            styleOverrides: {
                root: {
                    backgroundColor: normalPrimary
                }
            }
        }
    },
});


export const theme02 = createTheme({
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 1000,
            lg: 1200,
            xl: 1920
        }
    },
    components: {
        MuiButton: {
            defaultProps: {
                disableElevation: true
            },
            styleOverrides: {
                root: {
                    textTransform: 'none'
                },
                sizeSmall: {
                    padding: '6px 16px'
                },
                sizeMedium: {
                    padding: '8px 20px'
                },
                sizeLarge: {
                    padding: '11px 24px'
                },
                textSizeSmall: {
                    padding: '7px 12px'
                },
                textSizeMedium: {
                    padding: '9px 16px'
                },
                textSizeLarge: {
                    padding: '12px 16px'
                }
            }
        },
        MuiButtonBase: {
            defaultProps: {
                disableRipple: true
            }
        },
        MuiCardContent: {
            styleOverrides: {
                root: {
                    padding: '32px 24px',
                    '&:last-child': {
                        paddingBottom: '32px'
                    }
                }
            }
        },
        MuiCardHeader: {
            defaultProps: {
                titleTypographyProps: {
                    variant: 'h6'
                },
                subheaderTypographyProps: {
                    variant: 'body2'
                }
            },
            styleOverrides: {
                root: {
                    padding: '32px 24px'
                }
            }
        },
        MuiCssBaseline: {
            styleOverrides: {
                '*': {
                    boxSizing: 'border-box',
                    margin: 0,
                    padding: 0
                },
                html: {
                    MozOsxFontSmoothing: 'grayscale',
                    WebkitFontSmoothing: 'antialiased',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100%',
                    width: '100%'
                },
                body: {
                    display: 'flex',
                    flex: '1 1 auto',
                    flexDirection: 'column',
                    minHeight: '100%',
                    width: '100%'
                },
                '#__next': {
                    display: 'flex',
                    flex: '1 1 auto',
                    flexDirection: 'column',
                    height: '100%',
                    width: '100%'
                }
            }
        },
        MuiOutlinedInput: {
            styleOverrides: {
                notchedOutline: {
                    borderColor: '#E6E8F0'
                }
            }
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor: '#F3F4F6',
                    '.MuiTableCell-root': {
                        color: '#374151'
                    },
                    borderBottom: 'none',
                    '& .MuiTableCell-root': {
                        borderBottom: 'none',
                        fontSize: '12px',
                        fontWeight: 600,
                        lineHeight: 1,
                        letterSpacing: 0.5,
                        textTransform: 'uppercase'
                    },
                    '& .MuiTableCell-paddingCheckbox': {
                        paddingTop: 4,
                        paddingBottom: 4
                    }
                }
            }
        },
        MuiTableContainer: {
            styleOverrides: {
                root: {
                    maxWidth: (window.innerWidth - 30) + "px"
                }
            }
        },
        MuiAutocomplete: {
            styleOverrides: {

                popper: {
                    zIndex: 20000001
                }
            }
        },
    },
    palette: {
        neutral: {
            100: '#F3F4F6',
            200: '#E5E7EB',
            300: '#D1D5DB',
            400: '#9CA3AF',
            500: '#6B7280',
            600: '#4B5563',
            700: '#374151',
            800: '#1F2937',
            900: '#111827'
        },
        action: {
            active: '#6B7280',
            focus: 'rgba(55, 65, 81, 0.12)',
            hover: 'rgba(55, 65, 81, 0.04)',
            selected: 'rgba(55, 65, 81, 0.08)',
            disabledBackground: 'rgba(55, 65, 81, 0.12)',
            disabled: 'rgba(55, 65, 81, 0.26)'
        },
        background: {
            default: '#F9FAFC',
            paper: '#FFFFFF'
        },
        divider: '#E6E8F0',
        primary: {
            main: '#396689',
            light: '#828DF8',
            dark: '#3832A0',
            contrastText: '#FFFFFF'
        },
        secondary: {
            main: '#10B981',
            light: '#3FC79A',
            dark: '#0B815A',
            contrastText: '#FFFFFF'
        },
        success: {
            main: '#14B8A6',
            light: '#43C6B7',
            dark: '#0E8074',
            contrastText: '#FFFFFF'
        },
        info: {
            main: '#2196F3',
            light: '#64B6F7',
            dark: '#0B79D0',
            contrastText: '#FFFFFF'
        },
        warning: {
            main: '#FFB020',
            light: '#FFBF4C',
            dark: '#B27B16',
            contrastText: '#FFFFFF'
        },
        error: {
            main: '#D14343',
            light: '#DA6868',
            dark: '#922E2E',
            contrastText: '#FFFFFF'
        },
        text: {
            primary: '#121828',
            secondary: '#65748B',
            disabled: 'rgba(55, 65, 81, 0.48)'
        }
    },
    shape: {
        borderRadius: 8
    },
    shadows: [
        'none',
        '0px 1px 1px rgba(100, 116, 139, 0.06), 0px 1px 2px rgba(100, 116, 139, 0.1)',
        '0px 1px 2px rgba(100, 116, 139, 0.12)',
        '0px 1px 4px rgba(100, 116, 139, 0.12)',
        '0px 1px 5px rgba(100, 116, 139, 0.12)',
        '0px 1px 6px rgba(100, 116, 139, 0.12)',
        '0px 2px 6px rgba(100, 116, 139, 0.12)',
        '0px 3px 6px rgba(100, 116, 139, 0.12)',
        '0px 2px 4px rgba(31, 41, 55, 0.06), 0px 4px 6px rgba(100, 116, 139, 0.12)',
        '0px 5px 12px rgba(100, 116, 139, 0.12)',
        '0px 5px 14px rgba(100, 116, 139, 0.12)',
        '0px 5px 15px rgba(100, 116, 139, 0.12)',
        '0px 6px 15px rgba(100, 116, 139, 0.12)',
        '0px 7px 15px rgba(100, 116, 139, 0.12)',
        '0px 8px 15px rgba(100, 116, 139, 0.12)',
        '0px 9px 15px rgba(100, 116, 139, 0.12)',
        '0px 10px 15px rgba(100, 116, 139, 0.12)',
        '0px 12px 22px -8px rgba(100, 116, 139, 0.25)',
        '0px 13px 22px -8px rgba(100, 116, 139, 0.25)',
        '0px 14px 24px -8px rgba(100, 116, 139, 0.25)',
        '0px 10px 10px rgba(31, 41, 55, 0.04), 0px 20px 25px rgba(31, 41, 55, 0.1)',
        '0px 25px 50px rgba(100, 116, 139, 0.25)',
        '0px 25px 50px rgba(100, 116, 139, 0.25)',
        '0px 25px 50px rgba(100, 116, 139, 0.25)',
        '0px 25px 50px rgba(100, 116, 139, 0.25)'
    ],
    typography: {
        button: {
            fontWeight: 600
        },
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
        body1: {
            fontSize: '1rem',
            fontWeight: 400,
            lineHeight: 1.5
        },
        body2: {
            fontSize: '0.875rem',
            fontWeight: 400,
            lineHeight: 1.57
        },
        subtitle1: {
            fontSize: '1rem',
            fontWeight: 500,
            lineHeight: 1.75
        },
        subtitle2: {
            fontSize: '0.875rem',
            fontWeight: 500,
            lineHeight: 1.57
        },
        overline: {
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.5px',
            lineHeight: 2.5,
            textTransform: 'uppercase'
        },
        caption: {
            fontSize: '0.75rem',
            fontWeight: 400,
            lineHeight: 1.66
        },
        h1: {
            fontWeight: 700,
            fontSize: '3.5rem',
            lineHeight: 1.375
        },
        h2: {
            fontWeight: 700,
            fontSize: '3rem',
            lineHeight: 1.375
        },
        h3: {
            fontWeight: 700,
            fontSize: '2.25rem',
            lineHeight: 1.375
        },
        h4: {
            fontWeight: 700,
            fontSize: '2rem',
            lineHeight: 1.375
        },
        h5: {
            fontWeight: 600,
            fontSize: '1.5rem',
            lineHeight: 1.375
        },
        h6: {
            fontWeight: 600,
            fontSize: '1.125rem',
            lineHeight: 1.375
        }
    }
});


export const theme03 = createTheme({
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 1000,
            lg: 1200,
            xl: 1920
        }
    },
    components: {
        MuiButtonBase: {
            defaultProps: {
                disableRipple: true
            }
        },
        MuiButton: {
            defaultProps: {
                disableElevation: true
            },
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 12,
                    fontWeight: 600,
                    letterSpacing: '0.01em'
                },
                contained: {
                    background: 'linear-gradient(140deg, #4772b2 0%, #5f89c4 100%)',
                    boxShadow: '0px 6px 16px rgba(63, 99, 154, 0.16)',
                    '&:hover': {
                        background: 'linear-gradient(140deg, #3e66a3 0%, #527eb7 100%)',
                        boxShadow: '0px 8px 20px rgba(63, 99, 154, 0.2)'
                    }
                },
                outlined: {
                    borderColor: '#c7d6ec',
                    '&:hover': {
                        borderColor: '#afc4e4',
                        backgroundColor: 'rgba(59, 111, 178, 0.04)'
                    }
                },
                text: {
                    '&:hover': {
                        backgroundColor: 'rgba(59, 111, 178, 0.06)'
                    }
                },
                sizeSmall: {
                    padding: '6px 16px'
                },
                sizeMedium: {
                    padding: '8px 20px'
                },
                sizeLarge: {
                    padding: '11px 24px'
                },
                textSizeSmall: {
                    padding: '7px 12px'
                },
                textSizeMedium: {
                    padding: '9px 16px'
                },
                textSizeLarge: {
                    padding: '12px 16px'
                }
            }
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    color: '#f8fbff',
                    background: 'linear-gradient(140deg, #3f679e 0%, #3e7b9c 100%)',
                    borderRadius: 0,
                    backdropFilter: 'blur(8px)',
                    borderBottom: '1px solid rgba(15, 23, 42, 0.14)',
                    boxShadow: '0px 6px 16px rgba(35, 58, 88, 0.22)',
                    '& .MuiButton-root, & .MuiIconButton-root, & .MuiSvgIcon-root': {
                        color: '#f8fbff'
                    },
                    '& .MuiButton-text:hover, & .MuiIconButton-root:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.14)'
                    }
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    border: '1px solid #e1e8f4',
                    boxShadow: '0px 8px 22px rgba(15, 23, 42, 0.06)'
                }
            }
        },
        MuiCardContent: {
            styleOverrides: {
                root: {
                    padding: '32px 24px',
                    '&:last-child': {
                        paddingBottom: '32px'
                    }
                }
            }
        },
        MuiCardHeader: {
            defaultProps: {
                titleTypographyProps: {
                    variant: 'h6'
                },
                subheaderTypographyProps: {
                    variant: 'body2'
                }
            },
            styleOverrides: {
                root: {
                    padding: '32px 24px'
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    backgroundColor: '#f2f6fc',
                    color: '#36527c'
                }
            }
        },
        MuiCssBaseline: {
            styleOverrides: {
                '@keyframes pageReveal': {
                    from: {
                        opacity: 0,
                        transform: 'translateY(8px)'
                    },
                    to: {
                        opacity: 1,
                        transform: 'translateY(0px)'
                    }
                },
                '*': {
                    boxSizing: 'border-box',
                    margin: 0,
                    padding: 0
                },
                html: {
                    MozOsxFontSmoothing: 'grayscale',
                    WebkitFontSmoothing: 'antialiased',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100%',
                    width: '100%'
                },
                body: {
                    display: 'flex',
                    flex: '1 1 auto',
                    flexDirection: 'column',
                    minHeight: '100%',
                    width: '100%',
                    color: '#0f172a',
                    backgroundColor: '#f7f9fd',
                    backgroundImage: [
                        'radial-gradient(circle at 0% 0%, rgba(96, 165, 250, 0.16) 0, rgba(96, 165, 250, 0) 40%)',
                        'radial-gradient(circle at 100% 18%, rgba(45, 212, 191, 0.12) 0, rgba(45, 212, 191, 0) 34%)',
                        'linear-gradient(160deg, #fbfcff 0%, #f7f9fd 55%, #f1f5fb 100%)'
                    ]
                },
                '#root': {
                    animation: 'pageReveal 320ms ease-out'
                },
                '#__next': {
                    display: 'flex',
                    flex: '1 1 auto',
                    flexDirection: 'column',
                    height: '100%',
                    width: '100%'
                }
            }
        },
        MuiScopedCssBaseline: {
            styleOverrides: {
                root: {
                    minHeight: '100vh',
                    backgroundColor: 'transparent'
                }
            }
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: 'rgba(250, 252, 255, 0.96)',
                    backdropFilter: 'blur(8px)',
                    borderRight: '1px solid #e1e8f4'
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 14,
                    backgroundColor: 'rgba(255, 255, 255, 0.94)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid #e1e8f4',
                    '&.MuiAppBar-root': {
                        borderRadius: 0
                    }
                }
            }
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    backgroundColor: 'rgba(255, 255, 255, 0.96)',
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3b6fb2',
                        boxShadow: '0px 0px 0px 3px rgba(59, 111, 178, 0.1)'
                    }
                },
                notchedOutline: {
                    borderColor: '#dfe8f5'
                }
            }
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: '#5d6e86',
                    '&.Mui-focused': {
                        color: '#355f98'
                    }
                }
            }
        },
        MuiAccordion: {
            styleOverrides: {
                root: {
                    border: '1px solid #e1e8f4',
                    borderRadius: 14,
                    overflow: 'hidden'
                }
            }
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor: '#f3f7ff',
                    '.MuiTableCell-root': {
                        color: '#3c4c62'
                    },
                    borderBottom: 'none',
                    '& .MuiTableCell-root': {
                        borderBottom: 'none',
                        fontSize: '12px',
                        fontWeight: 600,
                        lineHeight: 1,
                        letterSpacing: 0.5,
                        textTransform: 'uppercase'
                    },
                    '& .MuiTableCell-paddingCheckbox': {
                        paddingTop: 4,
                        paddingBottom: 4
                    }
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderColor: '#e7edf8'
                }
            }
        },
        MuiTableContainer: {
            styleOverrides: {
                root: {
                    maxWidth: (window.innerWidth - 30) + "px"
                }
            }
        },
        MuiAutocomplete: {
            styleOverrides: {

                popper: {
                    zIndex: 20000001
                }
            }
        },
    },
    palette: {
        mode: 'light',
        neutral: {
            100: '#f7f9fd',
            200: '#eef2f8',
            300: '#dfe7f2',
            400: '#bac7d8',
            500: '#8697ac',
            600: '#687b93',
            700: '#4f6077',
            800: '#34455c',
            900: '#1b2a3f'
        },
        action: {
            active: '#687b93',
            focus: 'rgba(59, 111, 178, 0.12)',
            hover: 'rgba(59, 111, 178, 0.05)',
            selected: 'rgba(59, 111, 178, 0.08)',
            disabledBackground: 'rgba(134, 151, 172, 0.2)',
            disabled: 'rgba(104, 123, 147, 0.34)'
        },
        background: {
            default: '#f7f9fd',
            paper: '#FFFFFF'
        },
        divider: '#dfe8f5',
        primary: {
            main: '#3b6fb2',
            light: '#7196cd',
            dark: '#315d93',
            contrastText: '#FFFFFF'
        },
        secondary: {
            main: '#2f7f78',
            light: '#66aaa4',
            dark: '#276863',
            contrastText: '#FFFFFF'
        },
        success: {
            main: '#2f9753',
            light: '#63b97e',
            dark: '#287a45',
            contrastText: '#FFFFFF'
        },
        info: {
            main: '#3c7db1',
            light: '#76a8d1',
            dark: '#326891',
            contrastText: '#FFFFFF'
        },
        warning: {
            main: '#b7802b',
            light: '#cfa15f',
            dark: '#986820',
            contrastText: '#FFFFFF'
        },
        error: {
            main: '#c44d4d',
            light: '#d17373',
            dark: '#9f3f3f',
            contrastText: '#FFFFFF'
        },
        text: {
            primary: '#0f172a',
            secondary: '#52627a',
            disabled: 'rgba(82, 98, 122, 0.58)'
        }
    },
    shape: {
        borderRadius: 12
    },
    shadows: [
        'none',
        '0px 1px 2px rgba(15, 23, 42, 0.04)',
        '0px 1px 3px rgba(15, 23, 42, 0.05)',
        '0px 2px 4px rgba(15, 23, 42, 0.06)',
        '0px 3px 6px rgba(15, 23, 42, 0.06)',
        '0px 4px 8px rgba(15, 23, 42, 0.07)',
        '0px 5px 10px rgba(15, 23, 42, 0.07)',
        '0px 6px 12px rgba(15, 23, 42, 0.08)',
        '0px 8px 14px rgba(15, 23, 42, 0.08)',
        '0px 10px 16px rgba(15, 23, 42, 0.09)',
        '0px 12px 18px rgba(15, 23, 42, 0.09)',
        '0px 14px 20px rgba(15, 23, 42, 0.1)',
        '0px 16px 24px rgba(15, 23, 42, 0.1)',
        '0px 18px 26px rgba(15, 23, 42, 0.11)',
        '0px 20px 28px rgba(15, 23, 42, 0.11)',
        '0px 22px 30px rgba(15, 23, 42, 0.12)',
        '0px 24px 32px rgba(15, 23, 42, 0.12)',
        '0px 26px 36px rgba(15, 23, 42, 0.13)',
        '0px 28px 38px rgba(15, 23, 42, 0.13)',
        '0px 30px 40px rgba(15, 23, 42, 0.14)',
        '0px 32px 44px rgba(15, 23, 42, 0.14)',
        '0px 34px 46px rgba(15, 23, 42, 0.15)',
        '0px 36px 48px rgba(15, 23, 42, 0.15)',
        '0px 38px 50px rgba(15, 23, 42, 0.16)',
        '0px 40px 54px rgba(15, 23, 42, 0.16)'
    ],
    typography: {
        button: {
            fontWeight: 600
        },
        fontFamily: '"Plus Jakarta Sans", "Manrope", "Segoe UI", sans-serif',
        body1: {
            fontSize: '1rem',
            fontWeight: 400,
            lineHeight: 1.5
        },
        body2: {
            fontSize: '0.875rem',
            fontWeight: 400,
            lineHeight: 1.57
        },
        subtitle1: {
            fontSize: '1rem',
            fontWeight: 500,
            lineHeight: 1.75
        },
        subtitle2: {
            fontSize: '0.875rem',
            fontWeight: 500,
            lineHeight: 1.57
        },
        overline: {
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.5px',
            lineHeight: 2.5,
            textTransform: 'uppercase'
        },
        caption: {
            fontSize: '0.75rem',
            fontWeight: 400,
            lineHeight: 1.66
        },
        h1: {
            fontWeight: 700,
            fontSize: '3.25rem',
            lineHeight: 1.2
        },
        h2: {
            fontWeight: 700,
            fontSize: '2.75rem',
            lineHeight: 1.2
        },
        h3: {
            fontWeight: 700,
            fontSize: '2.15rem',
            lineHeight: 1.25
        },
        h4: {
            fontWeight: 700,
            fontSize: '1.85rem',
            lineHeight: 1.28
        },
        h5: {
            fontWeight: 600,
            fontSize: '1.5rem',
            lineHeight: 1.3
        },
        h6: {
            fontWeight: 600,
            fontSize: '1.125rem',
            lineHeight: 1.32
        }
    }
});

export const darkTheme3 = createTheme({
    palette: {
        primary: {
            main: "#064663"
        },
        secondary: {
            main: "#ECB365"
        },
        text: {
            primary: "#eeeeee"
        }
    },
    components: {
        MuiScopedCssBaseline: {
            styleOverrides: {
                root: {
                    background: [
                        "rgba(7, 71, 100, 1.0);",
                        "-webkit-radial-gradient(top left, rgba(7, 71, 100, 1.0), rgba(4, 29, 51, 1.0));",
                        "-moz-radial-gradient(top left, rgba(7, 71, 100, 1.0), rgba(4, 29, 51, 1.0));",
                        "radial-gradient(to bottom right, rgba(7, 71, 100, 1.0), rgba(4, 29, 51, 1.0));",
                    ],
                    minHeight: "100vh"
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundColor: "rgba(0,0,0,0.4)"
                }
            }
        }, MuiFormHelperText: {
            styleOverrides: {
                root: {
                    color: "lightgrey"
                }
            }
        }, MuiListItemText: {
            styleOverrides: {
                secondary: {
                    color: 'lightgray'
                }
            }
        }, MuiTypography: {
            styleOverrides: {
                body1: {
                    color: "white !important"
                }
            }
        },
        MuiButtonBase: {
            styleOverrides: {
                root: {
                    color: "#ECB365"
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    color: "#ECB365",
                    backgroundColor: "rgba(0,0,0,0.4)"
                },
                text: {
                    backgroundColor: "rgba(0,0,0,0.0)"
                }
            }
        },
        MuiSvgIcon: {
            styleOverrides: {
                root: {
                    color: "#eeeeee"
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: "none"
                }
            }
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    backgroundColor: "#064663"
                }
            }
        },
        MuiInputBase: {
            styleOverrides: {
                input: {
                    marginBottom: "3px",
                    color: "white"
                }
            }
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: "rgba(255,255,255,0.8)",
                    "&.Mui-focused": {
                        color: "rgba(255,255,255,0.8)"
                    }
                }, focused: {}
            }
        },
        MuiDialogContentText: {
            styleOverrides: {
                root: {
                    color: "rgba(255,255,255,0.9)"
                }
            }
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor: "rgba(255,255,255,0.05);"
                }
            }
        },
        MuiTableContainer: {
            styleOverrides: {
                root: {
                    maxWidth: (window.innerWidth - 30) + "px",
                    width: "fit-content"
                }
            }
        },
        MuiAutocomplete: {
            styleOverrides: {
                listbox: {
                    background: "rgba(0,0,0,0.85); "
                },
                popper: {
                    zIndex: 20000001
                }
            }
        }, MuiAvatar: {
            styleOverrides: {
                root: {
                    backgroundColor: "rgba(0,0,0,0.4)"
                }
            }
        },
        MuiAccordion: {
            styleOverrides: {
                root: {
                    maxWidth: (window.innerWidth - 30) + "px"
                }
            }
        },
        MuiAlert: {
            styleOverrides: {
                standardError: {
                    backgroundColor: "rgb(40 20 20);",
                    color: "#ffa99c"
                },
                standardInfo: {
                    backgroundColor: "rgb(10 30 30);",
                    color: "#67d0ff"
                },
                standardSuccess: {
                    backgroundColor: "rgb(20 40 20);",
                    color: "#60df66"
                },
                standardWarning: {
                    backgroundColor: "rgb(30 30 10);",
                    color: "#ffb346"
                }
            }
        }
    }
});

export const darkTheme4 = createTheme({
    palette: {
        primary: {
            main: "#064663"
        },
        secondary: {
            main: "#ECB365"
        },
        text: {
            primary: "#eeeeee"
        }
    },
    components: {
        MuiScopedCssBaseline: {
            styleOverrides: {
                root: {
                    background: [
                        "rgba(7, 71, 100, 1.0);",
                        "-webkit-radial-gradient(top left, rgba(7, 71, 100, 1.0), rgba(4, 29, 51, 1.0));",
                        "-moz-radial-gradient(top left, rgba(7, 71, 100, 1.0), rgba(4, 29, 51, 1.0));",
                        "radial-gradient(to bottom right, rgba(7, 71, 100, 1.0), rgba(4, 29, 51, 1.0));",
                    ],
                    minHeight: "100vh"
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundColor: "rgba(0,0,0,0.4)"
                }
            }
        }, MuiTypography: {
            styleOverrides: {
                body1: {
                    color: "white !important"
                }
            }
        }, MuiFormHelperText: {
            styleOverrides: {
                root: {
                    color: "lightgrey"
                }
            }
        },
        MuiButtonBase: {
            styleOverrides: {
                root: {
                    color: "#ECB365"
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    color: "#ECB365",
                    backgroundColor: "rgba(255,255,255,0.15)"
                },
                text: {
                    backgroundColor: "rgba(0,0,0,0.0)"
                }
            }
        },
        MuiSvgIcon: {
            styleOverrides: {
                root: {
                    color: "#eeeeee"
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: "none"
                }
            }
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    backgroundColor: "#064663"
                }
            }
        },
        MuiInputBase: {
            styleOverrides: {
                input: {
                    marginBottom: "3px",
                    color: "white"
                }
            }
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: "rgba(255,255,255,0.8)",
                    "&.Mui-focused": {
                        color: "rgba(255,255,255,0.8)"
                    }
                }, focused: {}
            }
        },
        MuiDialogContentText: {
            styleOverrides: {
                root: {
                    color: "rgba(255,255,255,0.9)"
                }
            }
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor: "rgba(255,255,255,0.05);"
                }
            }
        },
        MuiTableContainer: {
            styleOverrides: {
                root: {
                    maxWidth: (window.innerWidth - 30) + "px",
                    width: "fit-content"
                }
            }
        },
        MuiAutocomplete: {
            styleOverrides: {
                listbox: {
                    background: "rgba(0,0,0,0.85); "
                },
                popper: {
                    zIndex: 20000001
                }
            }
        },
        MuiListItemText: {
            styleOverrides: {
                secondary: {
                    color: 'lightgray'
                }
            }
        }, MuiAvatar: {
            styleOverrides: {
                root: {
                    backgroundColor: "rgba(0,0,0,0.4)"
                }
            }
        }, MuiAccordion: {
            styleOverrides: {
                root: {
                    maxWidth: (window.innerWidth - 30) + "px"
                }
            }
        },
        MuiAlert: {
            styleOverrides: {
                standardError: {
                    backgroundColor: "rgb(40 20 20);",
                    color: "#ffa99c"
                },
                standardInfo: {
                    backgroundColor: "rgb(10 30 30);",
                    color: "#67d0ff"
                },
                standardSuccess: {
                    backgroundColor: "rgb(20 40 20);",
                    color: "#60df66"
                },
                standardWarning: {
                    backgroundColor: "rgb(30 30 10);",
                    color: "#ffb346"
                }
            }
        }
    }
});

export const themes = [normalTheme, darkTheme1, darkTheme2, theme02, darkTheme3, darkTheme4, theme03]