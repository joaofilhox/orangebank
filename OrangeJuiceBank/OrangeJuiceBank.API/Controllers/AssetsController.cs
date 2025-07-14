using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrangeJuiceBank.API.Models;
using OrangeJuiceBank.Domain.Repositories;

namespace OrangeJuiceBank.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AssetsController : ControllerBase
    {
        private readonly IAssetRepository _assetRepository;

        public AssetsController(IAssetRepository assetRepository)
        {
            _assetRepository = assetRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var assets = await _assetRepository.GetAllAsync();

            var result = assets.Select(a => new AssetResponse
            {
                Id = a.Id,
                Name = a.Name,
                Type = a.Type,
                CurrentPrice = a.CurrentPrice
            });

            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAssetRequest request)
        {
            var asset = await _assetRepository.GetByIdAsync(id);
            
            if (asset == null)
            {
                return NotFound($"Asset com ID {id} não encontrado.");
            }

            asset.Name = request.Name;
            asset.Type = request.Type;
            asset.CurrentPrice = request.CurrentPrice;

            var updatedAsset = await _assetRepository.UpdateAsync(asset);

            var response = new AssetResponse
            {
                Id = updatedAsset.Id,
                Name = updatedAsset.Name,
                Type = updatedAsset.Type,
                CurrentPrice = updatedAsset.CurrentPrice
            };

            return Ok(response);
        }
    }
}
