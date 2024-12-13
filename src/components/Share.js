import React, { useState } from 'react';
import { FacebookShareButton, TwitterShareButton, LinkedinShareButton, WhatsappShareButton } from 'react-share';
import { FacebookIcon, TwitterIcon, LinkedinIcon, WhatsappIcon } from 'react-share';

const Share = ({ url, title, description }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleShareOptions = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="share-container">
      <button className="share-btn" onClick={toggleShareOptions}>
      ➢ Share
      </button>
      {isOpen && (
        <div className="share-options">
          <FacebookShareButton url={url} quote={title}>
            <FacebookIcon size={32} round />
          </FacebookShareButton>
          <TwitterShareButton url={url} title={title}>
            <TwitterIcon size={32} round />
          </TwitterShareButton>
          <LinkedinShareButton url={url}>
            <LinkedinIcon size={32} round />
          </LinkedinShareButton>
          <WhatsappShareButton url={url} title={title}>
            <WhatsappIcon size={32} round />
          </WhatsappShareButton>
        </div>
      )}
    </div>
  );
};

export default Share;
