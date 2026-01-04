/**
 * アフィリエイトバナーコンポーネント
 * A8.netのアフィリエイト広告を表示
 */

import './AffiliateBanner.css'

export default function AffiliateBanner() {
  return (
    <div className="affiliate-banner-container">
      <div className="pr-label">PR</div>
      <div className="affiliate-banner">
        <a
          href="https://px.a8.net/svt/ejp?a8mat=4AUXWS+FT6F3M+1IRY+1TK1F5"
          rel="nofollow"
          target="_blank"
          className="affiliate-link"
        >
          <img
            border={0}
            width={336}
            height={280}
            alt="広告"
            src="https://www23.a8.net/svt/bgt?aid=260104492956&wid=001&eno=01&mid=s00000007099011011000&mc=1"
            className="affiliate-image"
          />
        </a>
        <img
          border={0}
          width={1}
          height={1}
          src="https://www12.a8.net/0.gif?a8mat=4AUXWS+FT6F3M+1IRY+1TK1F5"
          alt=""
          style={{ display: 'none' }}
        />
      </div>
    </div>
  )
}
