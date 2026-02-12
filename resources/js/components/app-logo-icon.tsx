import type { ImgHTMLAttributes } from 'react';
import Logo from '../../../public/logo.svg';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return <img src={Logo} alt="App Logo" {...props} />;
}
