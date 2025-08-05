import html2canvas from 'html2canvas'
import { ImageFormat, IMAGE_FORMATS, MatchShareData } from '@/types/social'

export class ImageGeneratorService {
  private static instance: ImageGeneratorService
  
  private constructor() {}
  
  static getInstance(): ImageGeneratorService {
    if (!ImageGeneratorService.instance) {
      ImageGeneratorService.instance = new ImageGeneratorService()
    }
    return ImageGeneratorService.instance
  }

  async generateMatchImage(
    element: HTMLElement,
    format: ImageFormat = 'post'
  ): Promise<Blob | null> {
    try {
      const dimensions = IMAGE_FORMATS[format]
      
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        width: dimensions.width,
        height: dimensions.height
      })
      
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob)
        }, 'image/png', 1.0)
      })
    } catch (error) {
      console.error('Error generating image:', error)
      return null
    }
  }

  async generateFromTemplate(
    matchData: MatchShareData,
    format: ImageFormat = 'post'
  ): Promise<Blob | null> {
    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.left = '-9999px'
    container.style.top = '-9999px'
    container.style.width = `${IMAGE_FORMATS[format].width}px`
    container.style.height = `${IMAGE_FORMATS[format].height}px`
    
    container.innerHTML = this.getTemplate(matchData, format)
    document.body.appendChild(container)
    
    try {
      const blob = await this.generateMatchImage(container, format)
      document.body.removeChild(container)
      return blob
    } catch (error) {
      document.body.removeChild(container)
      throw error
    }
  }

  private getTemplate(matchData: MatchShareData, format: ImageFormat): string {
    const winner = matchData.winner 
      ? matchData.winner === 'A' ? matchData.teamA : matchData.teamB
      : null

    if (format === 'story') {
      return this.getStoryTemplate(matchData, winner)
    } else {
      return this.getPostTemplate(matchData, winner)
    }
  }

  private getStoryTemplate(matchData: MatchShareData, winner: any): string {
    return `
      <div style="
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #4A4A4A 0%, #2A2A2A 50%, #4A4A4A 100%);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        font-family: system-ui, -apple-system, sans-serif;
        color: white;
        padding: 60px 40px;
        box-sizing: border-box;
      ">
        <!-- Header -->
        <div style="
          padding: 30px;
          background: linear-gradient(90deg, #40E0D0 0%, #D2691E 100%);
          border-radius: 20px;
          text-align: center;
        ">
          <h1 style="
            font-size: 48px;
            font-weight: bold;
            margin: 0 0 10px 0;
            color: white;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          ">MSS MELAKA 2025</h1>
          <p style="
            font-size: 24px;
            margin: 0;
            opacity: 0.9;
          ">BASKETBALL CHAMPIONSHIP</p>
        </div>

        <!-- Match Content -->
        <div style="
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 40px;
        ">
          <div style="
            background: ${matchData.division === 'boys' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(236, 72, 153, 0.3)'};
            border: 2px solid ${matchData.division === 'boys' ? '#3B82F6' : '#EC4899'};
            padding: 10px 30px;
            border-radius: 50px;
            font-size: 24px;
            font-weight: 600;
          ">
            ${matchData.division === 'boys' ? 'BOYS' : 'GIRLS'} DIVISION
          </div>

          <h2 style="
            font-size: 72px;
            font-weight: bold;
            margin: 0;
            text-align: center;
          ">MATCH #${matchData.matchNumber}</h2>

          <!-- Teams -->
          <div style="width: 100%; max-width: 600px;">
            <div style="
              background: rgba(255, 255, 255, 0.1);
              border-radius: 24px;
              padding: 40px;
              margin-bottom: 30px;
              ${winner?.name === matchData.teamA.name ? 'box-shadow: 0 0 40px rgba(255, 215, 0, 0.4); border: 3px solid #FFD700;' : ''}
            ">
              <h3 style="font-size: 36px; margin: 0 0 10px 0;">${matchData.teamA.name}</h3>
              <div style="font-size: 84px; font-weight: bold; ${winner?.name === matchData.teamA.name ? 'color: #FFD700;' : ''}">${matchData.teamA.score ?? '-'}</div>
              ${winner?.name === matchData.teamA.name ? '<div style="color: #FFD700; font-size: 28px; margin-top: 10px;">🏆 WINNER</div>' : ''}
            </div>

            <div style="
              text-align: center;
              font-size: 48px;
              margin: 30px 0;
              opacity: 0.6;
            ">VS</div>

            <div style="
              background: rgba(255, 255, 255, 0.1);
              border-radius: 24px;
              padding: 40px;
              ${winner?.name === matchData.teamB.name ? 'box-shadow: 0 0 40px rgba(255, 215, 0, 0.4); border: 3px solid #FFD700;' : ''}
            ">
              <h3 style="font-size: 36px; margin: 0 0 10px 0;">${matchData.teamB.name}</h3>
              <div style="font-size: 84px; font-weight: bold; ${winner?.name === matchData.teamB.name ? 'color: #FFD700;' : ''}">${matchData.teamB.score ?? '-'}</div>
              ${winner?.name === matchData.teamB.name ? '<div style="color: #FFD700; font-size: 28px; margin-top: 10px;">🏆 WINNER</div>' : ''}
            </div>
          </div>

          <!-- Match Details -->
          <div style="
            text-align: center;
            font-size: 24px;
            opacity: 0.8;
            line-height: 1.6;
          ">
            <div>📍 ${matchData.venue}</div>
            <div>📅 ${matchData.date} | ⏰ ${matchData.time}</div>
          </div>
        </div>

        <!-- Footer -->
        <div style="
          text-align: center;
          font-size: 24px;
          opacity: 0.7;
        ">
          #MSSMelaka2025 #Basketball
        </div>
      </div>
    `
  }

  private getPostTemplate(matchData: MatchShareData, winner: any): string {
    return `
      <div style="
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #4A4A4A 0%, #2A2A2A 50%, #4A4A4A 100%);
        display: flex;
        flex-direction: column;
        font-family: system-ui, -apple-system, sans-serif;
        color: white;
        padding: 40px;
        box-sizing: border-box;
      ">
        <!-- Header -->
        <div style="
          padding: 20px;
          background: linear-gradient(90deg, #40E0D0 0%, #D2691E 100%);
          border-radius: 16px;
          text-align: center;
          margin-bottom: 30px;
        ">
          <h1 style="
            font-size: 36px;
            font-weight: bold;
            margin: 0 0 5px 0;
            color: white;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          ">MSS MELAKA BASKETBALL 2025</h1>
          <p style="
            font-size: 18px;
            margin: 0;
            opacity: 0.9;
          ">U12 CHAMPIONSHIP</p>
        </div>

        <!-- Match Info -->
        <div style="
          text-align: center;
          margin-bottom: 30px;
        ">
          <span style="
            display: inline-block;
            background: ${matchData.division === 'boys' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(236, 72, 153, 0.3)'};
            border: 2px solid ${matchData.division === 'boys' ? '#3B82F6' : '#EC4899'};
            padding: 8px 24px;
            border-radius: 50px;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
          ">
            ${matchData.division === 'boys' ? 'BOYS' : 'GIRLS'} DIVISION
          </span>
          <h2 style="
            font-size: 48px;
            font-weight: bold;
            margin: 0;
          ">MATCH #${matchData.matchNumber}</h2>
        </div>

        <!-- Teams Grid -->
        <div style="
          display: flex;
          gap: 30px;
          margin-bottom: 30px;
          flex: 1;
          align-items: center;
        ">
          <div style="
            flex: 1;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 30px;
            text-align: center;
            ${winner?.name === matchData.teamA.name ? 'box-shadow: 0 0 30px rgba(255, 215, 0, 0.4); border: 2px solid #FFD700;' : ''}
          ">
            <h3 style="font-size: 28px; margin: 0 0 15px 0;">${matchData.teamA.name}</h3>
            <div style="font-size: 72px; font-weight: bold; ${winner?.name === matchData.teamA.name ? 'color: #FFD700;' : ''}">${matchData.teamA.score ?? '-'}</div>
            ${winner?.name === matchData.teamA.name ? '<div style="color: #FFD700; font-size: 20px; margin-top: 10px;">🏆 WINNER</div>' : ''}
          </div>

          <div style="
            font-size: 36px;
            opacity: 0.6;
            font-weight: bold;
          ">VS</div>

          <div style="
            flex: 1;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 30px;
            text-align: center;
            ${winner?.name === matchData.teamB.name ? 'box-shadow: 0 0 30px rgba(255, 215, 0, 0.4); border: 2px solid #FFD700;' : ''}
          ">
            <h3 style="font-size: 28px; margin: 0 0 15px 0;">${matchData.teamB.name}</h3>
            <div style="font-size: 72px; font-weight: bold; ${winner?.name === matchData.teamB.name ? 'color: #FFD700;' : ''}">${matchData.teamB.score ?? '-'}</div>
            ${winner?.name === matchData.teamB.name ? '<div style="color: #FFD700; font-size: 20px; margin-top: 10px;">🏆 WINNER</div>' : ''}
          </div>
        </div>

        <!-- Footer -->
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        ">
          <div style="font-size: 18px; opacity: 0.8;">
            📍 ${matchData.venue} | 📅 ${matchData.date} ${matchData.time}
          </div>
          <div style="font-size: 16px; opacity: 0.7;">
            #MSSMelaka2025
          </div>
        </div>
      </div>
    `
  }

  async downloadImage(blob: Blob, filename: string): Promise<void> {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}