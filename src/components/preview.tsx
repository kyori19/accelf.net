import blogStyles from '../styles/blog.module.css'
import Link from 'next/link'

const Preview = ({ preview }: { preview: boolean }) => {
  return (
    <>
      {preview && (
        <div className={blogStyles.previewAlertContainer}>
          <div className={blogStyles.previewAlert}>
            <b>Note:</b>Viewing in preview mode
            <Link href={`/api/clear-preview`}>
              <button className={blogStyles.escapePreview}>Exit Preview</button>
            </Link>
          </div>
        </div>
      )}
    </>
  )
}

export default Preview
