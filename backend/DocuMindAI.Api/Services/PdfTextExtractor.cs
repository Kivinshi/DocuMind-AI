using System.Text;
using UglyToad.PdfPig;

namespace DocuMindAI.Api.Services;

public class PdfTextExtractor
{
    public async Task<string> ExtractTextAsync(Stream pdfStream)
    {
        if (pdfStream == null)
        {
            throw new ArgumentNullException(nameof(pdfStream));
        }

        if (pdfStream.CanSeek)
        {
            pdfStream.Position = 0;
        }

        using var memoryStream = new MemoryStream();

        await pdfStream.CopyToAsync(memoryStream);

        memoryStream.Position = 0;

        var text = new StringBuilder();

        using var document = PdfDocument.Open(memoryStream);

        foreach (var page in document.GetPages())
        {
            text.AppendLine(page.Text);
            text.AppendLine();
        }

        return text.ToString().Trim();
    }
}