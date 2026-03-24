exports.buildAnalysisPrompt = function () {
  return `Bu fotoğraftaki arızalı, hasarlı veya tamir edilmesi gereken parçaları tespit et.
Tespit ettiğin her parça için aşağıdaki JSON formatında yanıt ver.
Koordinatlar fotoğrafın sol üst köşesi (0,0) ve sağ alt köşesi (100,100) olacak şekilde yüzde cinsinden olmalı.
Yanıtın sadece JSON olsun, başka hiçbir açıklama ekleme.

Format:
{
  "steps": [
    {
      "step_order": 1,
      "coord_x": 45.2,
      "coord_y": 30.8,
      "description": "Parçanın ne olduğu ve ne yapılması gerektiği"
    }
  ]
}`;
};
