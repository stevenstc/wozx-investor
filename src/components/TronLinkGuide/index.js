import React from 'react';

import TronLinkLogo from './TronLinkLogo.png';


const WEBSTORE_URL = 'https://chrome.google.com/webstore/detail/ibnejdfjmmkpcnlpebklmnkoeoihofec/';

const logo = (
    <div className='col-xs-12 col-md-4 text-center'>
        <img src={ TronLinkLogo } className="img-fluid" alt='TronLink logo' />
    </div>
);

const openTronLink = () => {
    window.open(WEBSTORE_URL, '_blank');
};

const TronLinkGuide = props => {
    const {
        installed = false
    } = props;

    if(!installed) {
        return (
            <div className='row tron contact-content aos-init aos-animate' onClick={ openTronLink }>
                <div>
                    <h5>TronLink Required</h5>
                    <p>
                        To create a post or tip others you must install TronLink. TronLink is a TRON wallet for the browser
                        that can be <a href={ WEBSTORE_URL } target='_blank' rel='noopener noreferrer'>installed from the Chrome Webstore</a>.
                        Once installed, return back and refresh the page.
                    </p>
                </div>
                { logo }
            </div>
        );
    }

    return (
        <div className='row tron contact-content aos-init aos-animate' onClick={ openTronLink }>
            <div>
                <h5>Log in Required</h5>
                <p>
                    TronLink is installed but you must first log in. Open TronLink from the browser bar and set up your
                    first wallet or decrypt a previously-created wallet.
                </p>
            </div>
            { logo }
        </div>
    );
};

export default TronLinkGuide;